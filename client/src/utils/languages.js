export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js', color: '#fbbf24', template: '// JavaScript\nconsole.log("Hello, World!");\n' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', color: '#4f8ef7', template: '// TypeScript\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greet("World"));\n' },
  { id: 'jsx', label: 'React JSX', ext: 'jsx', color: '#38bdf8', template: 'import React from "react";\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}\n' },
  { id: 'tsx', label: 'React TSX', ext: 'tsx', color: '#38bdf8', template: 'import React from "react";\n\ninterface Props {\n  name: string;\n}\n\nexport default function App({ name }: Props) {\n  return <h1>Hello, {name}!</h1>;\n}\n' },
  { id: 'html', label: 'HTML', ext: 'html', color: '#f87171', template: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n' },
  { id: 'css', label: 'CSS', ext: 'css', color: '#a78bfa', template: '/* CSS Styles */\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f8fafc;\n}\n\nh1 {\n  color: #4f8ef7;\n}\n' },
  { id: 'scss', label: 'SCSS', ext: 'scss', color: '#f472b6', template: '// SCSS Styles\n$primary: #4f8ef7;\n$bg: #f8fafc;\n\nbody {\n  font-family: sans-serif;\n  background: $bg;\n\n  h1 {\n    color: $primary;\n  }\n}\n' },
  { id: 'python', label: 'Python', ext: 'py', color: '#34d399', template: '# Python\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))\n' },
  { id: 'java', label: 'Java', ext: 'java', color: '#fb923c', template: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n' },
  { id: 'cpp', label: 'C++', ext: 'cpp', color: '#60a5fa', template: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n' },
  { id: 'c', label: 'C', ext: 'c', color: '#60a5fa', template: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n' },
  { id: 'csharp', label: 'C#', ext: 'cs', color: '#a78bfa', template: '// C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n' },
  { id: 'go', label: 'Go', ext: 'go', color: '#38bdf8', template: '// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n' },
  { id: 'rust', label: 'Rust', ext: 'rs', color: '#fb923c', template: '// Rust\nfn main() {\n    println!("Hello, World!");\n}\n' },
  { id: 'php', label: 'PHP', ext: 'php', color: '#a78bfa', template: '<?php\n// PHP\necho "Hello, World!";\n?>\n' },
  { id: 'ruby', label: 'Ruby', ext: 'rb', color: '#f87171', template: '# Ruby\ndef greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("World")\n' },
  { id: 'swift', label: 'Swift', ext: 'swift', color: '#fb923c', template: '// Swift\nimport Foundation\n\nfunc greet(_ name: String) -> String {\n    return "Hello, \\(name)!"\n}\n\nprint(greet("World"))\n' },
  { id: 'kotlin', label: 'Kotlin', ext: 'kt', color: '#a78bfa', template: '// Kotlin\nfun greet(name: String): String {\n    return "Hello, $name!"\n}\n\nfun main() {\n    println(greet("World"))\n}\n' },
  { id: 'scala', label: 'Scala', ext: 'scala', color: '#f87171', template: '// Scala\nobject Main extends App {\n    def greet(name: String): String = s"Hello, $name!"\n    println(greet("World"))\n}\n' },
  { id: 'r', label: 'R', ext: 'r', color: '#60a5fa', template: '# R\ngreet <- function(name) {\n  paste("Hello,", name, "!")\n}\n\ncat(greet("World"), "\\n")\n' },
  { id: 'matlab', label: 'MATLAB', ext: 'm', color: '#fbbf24', template: '% MATLAB\nfunction result = greet(name)\n    result = sprintf("Hello, %s!", name);\nend\n\ndisp(greet("World"));\n' },
  { id: 'dart', label: 'Dart', ext: 'dart', color: '#38bdf8', template: '// Dart\nvoid main() {\n  print(greet("World"));\n}\n\nString greet(String name) {\n  return "Hello, $name!";\n}\n' },
  { id: 'lua', label: 'Lua', ext: 'lua', color: '#60a5fa', template: '-- Lua\nlocal function greet(name)\n    return "Hello, " .. name .. "!"\nend\n\nprint(greet("World"))\n' },
  { id: 'perl', label: 'Perl', ext: 'pl', color: '#a78bfa', template: '#!/usr/bin/perl\n# Perl\nuse strict;\nuse warnings;\n\nsub greet {\n    my ($name) = @_;\n    return "Hello, $name!";\n}\n\nprint greet("World") . "\\n";\n' },
  { id: 'shell', label: 'Shell/Bash', ext: 'sh', color: '#34d399', template: '#!/bin/bash\n# Shell Script\ngreet() {\n    echo "Hello, $1!"\n}\n\ngreet "World"\n' },
  { id: 'powershell', label: 'PowerShell', ext: 'ps1', color: '#60a5fa', template: '# PowerShell\nfunction Greet {\n    param([string]$name)\n    return "Hello, $name!"\n}\n\nWrite-Output (Greet "World")\n' },
  { id: 'sql', label: 'SQL', ext: 'sql', color: '#fbbf24', template: '-- SQL\nCREATE TABLE users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nSELECT * FROM users WHERE id = 1;\n' },
  { id: 'json', label: 'JSON', ext: 'json', color: '#fb923c', template: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "A sample project",\n  "scripts": {\n    "start": "node index.js",\n    "test": "jest"\n  },\n  "dependencies": {}\n}\n' },
  { id: 'yaml', label: 'YAML', ext: 'yml', color: '#f87171', template: '# YAML Configuration\nname: my-app\nversion: 1.0.0\n\nservices:\n  web:\n    image: nginx\n    ports:\n      - "80:80"\n\nenvironment:\n  NODE_ENV: production\n  PORT: 3000\n' },
  { id: 'xml', label: 'XML', ext: 'xml', color: '#fb923c', template: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <person>\n    <name>Ajit</name>\n    <role>Software Engineer</role>\n    <skills>\n      <skill>JavaScript</skill>\n      <skill>Python</skill>\n      <skill>Java</skill>\n    </skills>\n  </person>\n</root>\n' },
  { id: 'markdown', label: 'Markdown', ext: 'md', color: '#34d399', template: '# Project Title\n\n## Description\nA brief description of your project.\n\n## Installation\n```bash\nnpm install\nnpm start\n```\n\n## Usage\nDescribe how to use your project.\n\n## License\nMIT\n' },
  { id: 'dockerfile', label: 'Dockerfile', ext: 'dockerfile', color: '#38bdf8', template: 'FROM node:20-alpine\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm install --production\n\nCOPY . .\n\nEXPOSE 3000\n\nCMD ["node", "index.js"]\n' },
  { id: 'graphql', label: 'GraphQL', ext: 'graphql', color: '#f472b6', template: '# GraphQL Schema\ntype User {\n  id: ID!\n  name: String!\n  email: String!\n  posts: [Post!]!\n}\n\ntype Post {\n  id: ID!\n  title: String!\n  body: String!\n  author: User!\n}\n\ntype Query {\n  user(id: ID!): User\n  users: [User!]!\n  post(id: ID!): Post\n}\n\ntype Mutation {\n  createUser(name: String!, email: String!): User!\n  createPost(title: String!, body: String!, authorId: ID!): Post!\n}\n' },
  { id: 'vue', label: 'Vue', ext: 'vue', color: '#34d399', template: '<template>\n  <div class="app">\n    <h1>{{ message }}</h1>\n    <button @click="greet">Click me</button>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: "App",\n  data() {\n    return {\n      message: "Hello, World!"\n    };\n  },\n  methods: {\n    greet() {\n      this.message = "Hello from Vue!";\n    }\n  }\n};\n</script>\n\n<style scoped>\n.app {\n  font-family: sans-serif;\n  padding: 20px;\n}\n</style>\n' },
  { id: 'svelte', label: 'Svelte', ext: 'svelte', color: '#fb923c', template: '<script>\n  let name = "World";\n  let count = 0;\n\n  function increment() {\n    count += 1;\n  }\n</script>\n\n<h1>Hello, {name}!</h1>\n<button on:click={increment}>\n  Clicked {count} times\n</button>\n\n<style>\n  h1 {\n    color: #ff3e00;\n  }\n</style>\n' },
  { id: 'haskell', label: 'Haskell', ext: 'hs', color: '#a78bfa', template: '-- Haskell\nmodule Main where\n\ngreet :: String -> String\ngreet name = "Hello, " ++ name ++ "!"\n\nmain :: IO ()\nmain = putStrLn (greet "World")\n' },
  { id: 'elixir', label: 'Elixir', ext: 'ex', color: '#a78bfa', template: '# Elixir\ndefmodule Greeter do\n  def greet(name) do\n    "Hello, #{name}!"\n  end\nend\n\nIO.puts Greeter.greet("World")\n' },
  { id: 'clojure', label: 'Clojure', ext: 'clj', color: '#34d399', template: '; Clojure\n(defn greet [name]\n  (str "Hello, " name "!"))\n\n(println (greet "World"))\n' },
  { id: 'julia', label: 'Julia', ext: 'jl', color: '#a78bfa', template: '# Julia\nfunction greet(name::String)::String\n    return "Hello, $name!"\nend\n\nprintln(greet("World"))\n' },
  { id: 'objectivec', label: 'Objective-C', ext: 'm', color: '#60a5fa', template: '// Objective-C\n#import <Foundation/Foundation.h>\n\nint main() {\n    NSString *greeting = @"Hello, World!";\n    NSLog(@"%@", greeting);\n    return 0;\n}\n' },
  { id: 'plaintext', label: 'Plain Text', ext: 'txt', color: '#888', template: 'Hello, World!\n' },
];

export const LANG_MAP = Object.fromEntries(LANGUAGES.map(l => [l.id, l]));

export function getLangByExt(ext) {
  return LANGUAGES.find(l => l.ext === ext) || LANGUAGES[0];
}

export function getLangColor(langId) {
  return LANG_MAP[langId]?.color || '#888';
}
