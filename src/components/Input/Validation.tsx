interface ValidationProps {
  status: boolean;
  message: string;
  className?: string;
}

function Validation({ status, message, className }: ValidationProps) {
  return (
    <p
      className={`fs-13 mx-2 my-1 px-1 ${status ? 'text-success' : 'text-error'} ${className ? className : ''}`}
    >
      {message}
    </p>
  );
}

export default Validation;
