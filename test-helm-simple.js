function preprocessHelmTemplate(template) {
  let processed = template;
  const lines = processed.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip lines that are only control flow (if, with, range, else, end)
    if (/^\s*\{\{-?\s*(if|with|range|else|end)\s+.*-?\}\}\s*$/.test(line)) {
      continue;
    }
    
    // Replace include with nindent (e.g., {{ include "name" . | nindent 4 }}) with app name
    line = line.replace(/\{\{-?\s*include\s+"[^"]+"\s+\.\s*\|\s*nindent\s+\d+\s*-?\}\}/g, 'app: myapp');
    // Remove toYaml with nindent (e.g., {{ toYaml .Values.something | nindent 4 }})
    line = line.replace(/\{\{-?\s*toYaml\s+[^}]+\s*\|\s*nindent\s+\d+\s*-?\}\}/g, '');
    // Replace simple include (e.g., {{ include "name" . }}) with app name
    line = line.replace(/\{\{-?\s*include\s+"[^"]+"\s+\.\s*-?\}\}/g, 'myapp');
    // Replace .Values references (e.g., {{ .Values.replicaCount }}) with a default value
    line = line.replace(/\{\{-?\s*\.Values\.[a-zA-Z0-9._]+\s*-?\}\}/g, '3');
    // Replace .Chart references (e.g., {{ .Chart.Name }}) with app name
    line = line.replace(/\{\{-?\s*\.Chart\.[a-zA-Z0-9._]+\s*-?\}\}/g, 'myapp');
    // Replace .Release references (e.g., {{ .Release.Name }}) with release name
    line = line.replace(/\{\{-?\s*\.Release\.[a-zA-Z0-9._]+\s*-?\}\}/g, 'myrelease');
    // Replace expressions with quote filter (e.g., {{ .Values.something | quote }}) with quoted value
    line = line.replace(/\{\{-?\s*[^}]+\s*\|\s*quote\s*-?\}\}/g, '"value"');
    // Replace expressions with default filter (e.g., {{ .Values.tag | default "latest" }}) with default value
    line = line.replace(/\{\{-?\s*[^}]+\s*\|\s*default\s+[^}]+\s*-?\}\}/g, 'latest');
    // Replace any remaining template expressions with generic value
    line = line.replace(/\{\{-?[^}]+-?\}\}/g, 'value');
    
    // Only add non-empty lines or lines with meaningful content
    if (line.trim() || result.length === 0) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

const helmTemplate = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "infinity-fitness-services.fullname" . }}
  labels:
    {{- include "infinity-fitness-services.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "infinity-fitness-services.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "infinity-fitness-services.labels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP`;

console.log('=== Original Helm Template ===');
console.log(helmTemplate);
console.log('\n=== Preprocessed YAML ===');
const processed = preprocessHelmTemplate(helmTemplate);
console.log(processed);