const LoadingSpinner = ({ size = 'md', text = 'Memuat...' }) => {
  const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="text-muted mt-2 mb-0">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;