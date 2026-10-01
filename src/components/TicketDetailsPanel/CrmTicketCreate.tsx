/**
 * CrmTicketCreate — body of the "Create a ticket" view: pick a CRM partner,
 * then fill a small form (4 inputs, description, attachments dropzone).
 */
import { useId, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { IntegrationsHomePage, type IntegrationPartner } from '../IntegrationsHomePage';
import { CloseIcon } from '../icons';

const INPUTS = ['Subject', 'Requester name', 'Requester email', 'Priority'] as const;

function Dropzone({ files, onFiles }: { files: File[]; onFiles: (next: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const add = (list: FileList | null) => list && onFiles([...files, ...Array.from(list)]);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    add(e.dataTransfer.files);
  };

  return (
    <div className="lc-tdp__field">
      <span className="lc-tdp__field-label">Attachments</span>
      <button
        type="button"
        className="lc-tdp__dropzone"
        data-dragging={dragging || undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        Drag &amp; drop files here, or <u>browse</u>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          add(e.currentTarget.files);
          e.currentTarget.value = '';
        }}
      />
      {files.map((file, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${file.name}-${i}`} className="lc-tdp__tag">
          {file.name}
          <button
            type="button"
            className="lc-tdp__tag-remove"
            aria-label={`Remove ${file.name}`}
            onClick={() => onFiles(files.filter((_, j) => j !== i))}
          >
            <CloseIcon />
          </button>
        </span>
      ))}
    </div>
  );
}

function TicketForm({ formId, onCreated }: { formId: string; onCreated: () => void }) {
  const idBase = useId();
  const [files, setFiles] = useState<File[]>([]);
  // ponytail: no backend yet — submit just returns to the picker
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onCreated();
  };

  return (
    <form id={formId} className="lc-tdp__fields" onSubmit={submit}>
      {INPUTS.map((label) => (
        <label key={label} className="lc-tdp__field">
          <span className="lc-tdp__field-label">{label}</span>
          <input className="lc-tdp__field-input" type="text" name={label} />
        </label>
      ))}
      <label className="lc-tdp__field" htmlFor={`${idBase}-desc`}>
        <span className="lc-tdp__field-label">Description</span>
      </label>
      <textarea id={`${idBase}-desc`} className="lc-tdp__field-input lc-tdp__field-textarea" rows={4} />
      <Dropzone files={files} onFiles={setFiles} />
    </form>
  );
}

export function CrmTicketCreate({
  partners,
  partnerId,
  formId,
  onSelect,
  onCreated,
}: {
  partners: IntegrationPartner[];
  /** Picked partner; `undefined` shows the picker. */
  partnerId?: string;
  formId: string;
  onSelect: (partner: IntegrationPartner | null) => void;
  onCreated: () => void;
}) {
  if (partnerId) return <TicketForm formId={formId} onCreated={onCreated} />;
  return (
    <IntegrationsHomePage
      compact
      categories={[{ id: 'crm', title: '', partners }]}
      onPartnerClick={(id) => onSelect(partners.find((p) => p.id === id) ?? null)}
    />
  );
}
