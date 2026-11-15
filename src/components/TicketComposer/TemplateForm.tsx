/** After a template is picked: its body and one field per `{}` it carries. Send stays disabled until all are filled. */
import { useId } from 'react';
import type { CannedResponseOption } from './CannedResponsesDrawer';

interface TemplateFormProps {
  template: CannedResponseOption;
  values: string[];
  onChange: (values: string[]) => void;
  onBack: () => void;
}

export function TemplateForm({ template, values, onChange, onBack }: TemplateFormProps) {
  const id = useId();
  const params = template.params ?? [];
  return (
    <div className="lc-ticket-composer__template-form">
      <div className="lc-ticket-composer__template-head">
        <span className="lc-ticket-composer__template-name">{template.name}</span>
        <button type="button" className="lc-ticket-composer__link-btn" onClick={onBack}>
          Change template
        </button>
      </div>
      <p className="lc-ticket-composer__template-body">{template.message}</p>
      {params.length > 0 && (
        <div className="lc-ticket-composer__params">
          {params.map((param, i) => (
            <label key={param} className="lc-ticket-composer__param" htmlFor={`${id}-${i}`}>
              <span>{param}</span>
              <input
                id={`${id}-${i}`}
                value={values[i] ?? ''}
                required
                onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
