export function preprocessHelmTemplate(template: string): string {
  let processed = template;
  const lines = processed.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip lines that are only control flow
    if (/^\s*\{\{-?\s*(if|with|range|else|end)\s+.*-?\}\}\s*$/.test(line)) {
      continue;
    }
    
    // Replace inline template expressions
    line = line.replace(/\{\{-?\s*include\s+"[^"]+"\s+\.\s*\|\s*nindent\s+\d+\s*-?\}\}/g, 'app: myapp');
    line = line.replace(/\{\{-?\s*toYaml\s+[^}]+\s*\|\s*nindent\s+\d+\s*-?\}\}/g, '');
    line = line.replace(/\{\{-?\s*include\s+"[^"]+"\s+\.\s*-?\}\}/g, 'myapp');
    line = line.replace(/\{\{-?\s*\.Values\.[a-zA-Z0-9._]+\s*-?\}\}/g, '3');
    line = line.replace(/\{\{-?\s*\.Chart\.[a-zA-Z0-9._]+\s*-?\}\}/g, 'myapp');
    line = line.replace(/\{\{-?\s*\.Release\.[a-zA-Z0-9._]+\s*-?\}\}/g, 'myrelease');
    line = line.replace(/\{\{-?\s*[^}]+\s*\|\s*quote\s*-?\}\}/g, '"value"');
    line = line.replace(/\{\{-?\s*[^}]+\s*\|\s*default\s+[^}]+\s*-?\}\}/g, 'latest');
    line = line.replace(/\{\{-?[^}]+-?\}\}/g, 'value');
    
    // Only add non-empty lines or lines with meaningful content
    if (line.trim() || result.length === 0) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

export function isHelmTemplate(content: string): boolean {
  return /\{\{-?[\s\S]*?-?\}\}/.test(content);
}

export function extractResourceName(template: string): string {
  const nameMatch = template.match(/name:\s*\{\{-?\s*include\s+"([^"]+)"/); 
  return nameMatch ? nameMatch[1].split('.')[0] : 'helm-resource';
}
