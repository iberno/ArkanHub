interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
}

export function FormInput({ label, value, onChange, placeholder, required, type = 'text', className = '' }: Props) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label"><span className="label-text">{label}{required && <span className="text-error ml-0.5">*</span>}</span></label>
      <input type={type} className="input input-bordered" placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
