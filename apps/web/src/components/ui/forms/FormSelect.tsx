interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function FormSelect({ label, value, onChange, options, placeholder = 'Selecione...', required, className = '' }: Props) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label"><span className="label-text">{label}{required && <span className="text-error ml-0.5">*</span>}</span></label>
      <select className="select select-bordered" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">{placeholder}</option>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}
