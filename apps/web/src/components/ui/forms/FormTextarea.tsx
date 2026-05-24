interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea({ label, value, onChange, placeholder, required, rows = 4, className = '' }: Props) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label"><span className="label-text">{label}{required && <span className="text-error ml-0.5">*</span>}</span></label>
      <textarea className="textarea textarea-bordered" rows={rows} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
