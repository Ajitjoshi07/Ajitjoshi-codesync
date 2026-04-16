import { useState, useEffect, useRef } from 'react';

const TASK_STATUSES = {
  open:        { label: 'Open',        color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'   },
  inprogress:  { label: 'In Progress', color: '#4f8ef7', bg: 'rgba(79,142,247,0.1)'   },
  done:        { label: 'Done',        color: '#34d399', bg: 'rgba(52,211,153,0.1)'    },
  unavailable: { label: 'Unavailable', color: '#f87171', bg: 'rgba(248,113,113,0.1)'  },
};

function genId() { return 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }
function timeStr(date) {
  const d = new Date(date);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

export default function ChatPanel({ userName, userColor, users, ydoc, minimized, onToggle }) {
  const [, forceUpdate] = useState(0);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState('chat');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [showNewTask, setShowNewTask] = useState(false);
  const feedRef = useRef(null);
  const yMessages = useRef(null);
  const yTasks = useRef(null);

  useEffect(() => {
    // ydoc is now a ref object — access the Y.Doc via ydoc.current
    const doc = ydoc?.current;
    if (!doc) return;
    yMessages.current = doc.getArray('chat_messages');
    yTasks.current = doc.getArray('tasks');
    const sync = () => forceUpdate(v => v + 1);
    yMessages.current.observe(sync);
    yTasks.current.observe(sync);
    return () => {
      yMessages.current?.unobserve(sync);
      yTasks.current?.unobserve(sync);
    };
  }, [ydoc]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  });

  function sendMessage() {
    if (!input.trim() || !yMessages.current) return;
    yMessages.current.push([{ id: genId(), type: 'chat', user: userName, color: userColor, text: input.trim(), time: Date.now() }]);
    setInput('');
  }

  function clearChat() {
    if (!yMessages.current) return;
    if (window.confirm('Clear all chat messages?')) {
      yMessages.current.delete(0, yMessages.current.length);
    }
  }

  function createTask() {
    if (!taskTitle.trim() || !yMessages.current || !yTasks.current) return;
    const task = { id: genId(), type: 'task', user: userName, color: userColor, title: taskTitle.trim(), description: taskDesc.trim(), priority: taskPriority, status: 'open', assignee: null, time: Date.now() };
    yTasks.current.push([task]);
    yMessages.current.push([{ id: genId(), type: 'task_created', user: userName, color: userColor, taskId: task.id, taskTitle: task.title, priority: task.priority, time: Date.now() }]);
    setTaskTitle(''); setTaskDesc(''); setShowNewTask(false);
  }

  function updateTaskStatus(taskId, status, assignee = null) {
    if (!yTasks.current) return;
    const tasks = yTasks.current.toArray();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;
    const updated = { ...tasks[idx], status, assignee: assignee || tasks[idx].assignee };
    yTasks.current.delete(idx, 1);
    yTasks.current.insert(idx, [updated]);
    yMessages.current?.push([{ id: genId(), type: 'task_update', user: userName, color: userColor, taskId, taskTitle: tasks[idx].title, status, time: Date.now() }]);
  }

  function deleteTask(taskId) {
    if (!yTasks.current) return;
    const tasks = yTasks.current.toArray();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) yTasks.current.delete(idx, 1);
  }

  const allMessages = yMessages.current?.toArray() || [];
  const allTasks = yTasks.current?.toArray() || [];
  const chatMessages = allMessages.filter(m => ['chat','task_created','task_update'].includes(m.type));
  const openTasks = allTasks.filter(t => t.status === 'open' || t.status === 'inprogress');
  const doneTasks = allTasks.filter(t => t.status === 'done');
  const priorityColors = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };

  if (minimized) {
    return (
      <div style={{ width: '32px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onToggle} title="Expand Chat"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '12px', padding: '10px 0' }}>◀</button>
        {openTasks.length > 0 && (
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: '700' }}>
            {openTasks.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '260px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      {/* Tab header */}
      <div style={{ display: 'flex', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', flexShrink: 0, alignItems: 'center' }}>
        <button onClick={onToggle} title="Minimize"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '12px', padding: '0 8px', height: '36px' }}>▶</button>
        {[['chat','💬 Chat'],['tasks','📋 Tasks']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '8px 4px', fontSize: '11px', fontWeight: '600', border: 'none', borderBottom: tab===t ? '2px solid var(--accent)' : '2px solid transparent', background: 'transparent', color: tab===t ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            {label}
            {t==='tasks' && openTasks.length > 0 && (
              <span style={{ marginLeft: '4px', background: '#f87171', color: '#fff', borderRadius: '10px', padding: '0 5px', fontSize: '9px' }}>{openTasks.length}</span>
            )}
          </button>
        ))}
        {tab === 'chat' && chatMessages.length > 0 && (
          <button onClick={clearChat} title="Clear chat"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '12px', padding: '0 8px' }}>🗑</button>
        )}
      </div>

      {/* CHAT TAB */}
      {tab === 'chat' && (
        <>
          <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {chatMessages.length === 0 && (
              <div style={{ padding: '20px 14px', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: '1.6' }}>
                No messages yet.<br />Say hello to your teammates!
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id}>
                {msg.type === 'chat' && (
                  <div style={{ padding: '4px 12px', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: msg.color }}>{msg.user === userName ? 'You' : msg.user}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>{timeStr(msg.time)}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.5', background: msg.user===userName ? 'rgba(79,142,247,0.08)' : 'var(--surface2)', borderRadius: '0 8px 8px 8px', padding: '6px 10px', display: 'inline-block', maxWidth: '100%', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  </div>
                )}
                {msg.type === 'task_created' && (
                  <div style={{ padding: '4px 12px', marginBottom: '4px' }}>
                    <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: '700', marginBottom: '2px' }}>📋 New Task</div>
                      <div style={{ fontSize: '11px', color: 'var(--text)' }}>{msg.taskTitle}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '2px' }}>{msg.user} · {timeStr(msg.time)}</div>
                    </div>
                  </div>
                )}
                {msg.type === 'task_update' && (
                  <div style={{ padding: '3px 12px', marginBottom: '2px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                      <span style={{ color: msg.color }}>{msg.user===userName ? 'You' : msg.user}</span> marked "{msg.taskTitle}" as <span style={{ color: TASK_STATUSES[msg.status]?.color }}>{TASK_STATUSES[msg.status]?.label}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '8px', borderTop: '1px solid var(--border)', display: 'flex', gap: '6px', flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '7px 12px', fontSize: '12px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-ui)' }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <button onClick={sendMessage}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: input.trim() ? 'var(--accent)' : 'var(--surface2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>↑</button>
          </div>
        </>
      )}

      {/* TASKS TAB */}
      {tab === 'tasks' && (
        <>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <button onClick={() => setShowNewTask(v => !v)}
              style={{ width: '100%', padding: '7px', background: showNewTask ? 'var(--surface2)' : 'var(--accent)', color: showNewTask ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
              {showNewTask ? '✕ Cancel' : '+ Assign Task'}
            </button>
            {showNewTask && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-ui)' }}
                  onFocus={e => e.target.style.borderColor='var(--accent)'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                />
                <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Description (optional)..." rows={2}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 10px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-ui)', resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Priority:</span>
                  {['high','medium','low'].map(p => (
                    <button key={p} onClick={() => setTaskPriority(p)}
                      style={{ padding: '3px 8px', borderRadius: '10px', border: `1px solid ${priorityColors[p]}`, background: taskPriority===p ? priorityColors[p]+'33' : 'transparent', color: priorityColors[p], fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: '600' }}>
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={createTask}
                  style={{ background: '#fbbf24', color: '#0d1117', border: 'none', borderRadius: '6px', padding: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                  Create Task
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {allTasks.length === 0 && (
              <div style={{ padding: '20px 14px', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: '1.6' }}>
                No tasks yet.<br />Assign work to your team!
              </div>
            )}
            {openTasks.length > 0 && (
              <div style={{ padding: '6px 10px 2px', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>
                Active ({openTasks.length})
              </div>
            )}
            {openTasks.map(task => (
              <div key={task.id} style={{ margin: '4px 8px', background: 'var(--surface2)', border: `1px solid ${priorityColors[task.priority]}33`, borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', lineHeight: '1.4' }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>{task.description}</div>}
                  </div>
                  <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: priorityColors[task.priority]+'22', color: priorityColors[task.priority], fontWeight: '700', flexShrink: 0 }}>{task.priority}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: task.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#fff', fontWeight: '700', flexShrink: 0 }}>{task.user.substring(0,2).toUpperCase()}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>by {task.user===userName ? 'you' : task.user}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 7px', borderRadius: '8px', background: TASK_STATUSES[task.status].bg, color: TASK_STATUSES[task.status].color, fontWeight: '600' }}>
                    {TASK_STATUSES[task.status].label}{task.assignee && ` · ${task.assignee===userName?'you':task.assignee}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button onClick={() => updateTaskStatus(task.id, 'inprogress', userName)}
                    style={{ flex: 1, padding: '4px 6px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: '5px', color: '#4f8ef7', fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: '600' }}>
                    ▶ I'll do it
                  </button>
                  <button onClick={() => updateTaskStatus(task.id, 'done', userName)}
                    style={{ flex: 1, padding: '4px 6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '5px', color: '#34d399', fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: '600' }}>
                    ✓ Done
                  </button>
                  <button onClick={() => updateTaskStatus(task.id, 'unavailable')}
                    style={{ padding: '4px 6px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '5px', color: '#f87171', fontSize: '10px', cursor: 'pointer' }}>✗</button>
                  {task.user===userName && (
                    <button onClick={() => deleteTask(task.id)}
                      style={{ padding: '4px 6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-faint)', fontSize: '10px', cursor: 'pointer' }}>🗑</button>
                  )}
                </div>
              </div>
            ))}
            {doneTasks.length > 0 && (
              <>
                <div style={{ padding: '10px 10px 2px', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Completed ({doneTasks.length})</div>
                {doneTasks.map(task => (
                  <div key={task.id} style={{ margin: '4px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#34d399' }}>✓</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through', flex: 1 }}>{task.title}</span>
                      <button onClick={() => deleteTask(task.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
