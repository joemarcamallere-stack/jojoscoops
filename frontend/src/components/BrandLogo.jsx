import { Link } from 'react-router-dom';
import CreamyIcon from './CreamyIcon';

export default function BrandLogo({ className = '', linkTo = '/', showText = true, iconSize = 36 }) {
  const content = (
    <>
      <CreamyIcon size={iconSize} className="brand-logo-icon" />
      {showText ? (
        <span className="brand-logo-text"><span className="brand-logo-accent">Jojo</span>&apos;s</span>
      ) : null}
    </>
  );

  const classes = ['brand-logo', className].filter(Boolean).join(' ');

  if (linkTo) {
    return (
      <Link to={linkTo} className={classes} aria-label="Jojo's home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
