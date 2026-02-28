import { preprocessHelmTemplate } from './src/lib/helm-preprocessor';
import { readFileSync } from 'fs';

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
