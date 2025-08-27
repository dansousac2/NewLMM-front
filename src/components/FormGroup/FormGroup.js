import './FormGroup.css';

export default function FormGroup({ htmlFor, label, children }) {
  return (
    <div className="form-group">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}