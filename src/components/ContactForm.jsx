import { useRef, useState } from 'react';
import { fillTemplate, whatsappUrl } from '../utils/text.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = ['name', 'email', 'message'];
const EMPTY = { name: '', email: '', message: '' };

function validate(values, copy) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) errors.name = copy.name.errorRequired;
  else if (name.length < 2) errors.name = copy.name.errorShort;

  if (!email) errors.email = copy.email.errorRequired;
  else if (!EMAIL_PATTERN.test(email)) errors.email = copy.email.errorInvalid;

  if (!message) errors.message = copy.message.errorRequired;
  else if (message.length < 10) errors.message = copy.message.errorShort;

  return errors;
}

export default function ContactForm({ form, phoneE164 }) {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', link: '' });
  const fieldRefs = useRef({});
  const copy = form.fields;

  const errors = validate(values, copy);
  const visibleError = (field) => (submitted || touched[field]) && errors[field];

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (status.type !== 'idle') setStatus({ type: 'idle', link: '' });
  };

  const onBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      setStatus({ type: 'invalid', link: '' });
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    const text = fillTemplate(form.messageTemplate, {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    });
    const link = whatsappUrl(phoneE164, text);
    const opened = window.open(link, '_blank');

    if (opened) {
      opened.opener = null;
      setStatus({ type: 'success', link });
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
    } else {
      setStatus({ type: 'blocked', link });
    }
  };

  const field = (name, props) => {
    const error = visibleError(name);
    const hintId = copy[name].hint ? `${name}-hint` : null;
    const errorId = error ? `${name}-error` : null;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
    const Control = props.multiline ? 'textarea' : 'input';
    const { multiline, ...controlProps } = props;

    return (
      <div className={`field${error ? ' has-error' : ''}`}>
        <label htmlFor={`contact-${name}`}>{copy[name].label}</label>
        <Control
          ref={(node) => {
            fieldRefs.current[name] = node;
          }}
          id={`contact-${name}`}
          name={name}
          value={values[name]}
          placeholder={copy[name].placeholder}
          onChange={onChange}
          onBlur={onBlur}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          rows={multiline ? 5 : undefined}
          {...controlProps}
        />
        {hintId && (
          <p id={hintId} className="field__hint">
            {copy[name].hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="field__error">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="form" noValidate onSubmit={onSubmit} aria-labelledby="form-title">
      <p className="form__ticket" aria-hidden="true">
        <span>ordine.nuovo()</span>
        <span>espresso × 1</span>
      </p>
      <h3 id="form-title" className="form__title">
        {form.title}
      </h3>
      <p className="form__note">{form.note}</p>

      {field('name', { type: 'text', autoComplete: 'name' })}
      {field('email', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
      {field('message', { multiline: true })}

      <button type="submit" className="button button--primary button--block">
        {form.submitLabel}
        <span className="button__arrow" aria-hidden="true">
          →
        </span>
      </button>

      <div className="form__status" role="status" aria-live="polite">
        {status.type === 'invalid' && <p className="form__message form__message--error">{form.errorSummary}</p>}
        {status.type === 'success' && (
          <p className="form__message form__message--success">
            <strong>{form.successTitle}</strong> {form.successText}{' '}
            <a href={status.link} target="_blank" rel="noopener noreferrer">
              {form.openLinkLabel}
            </a>
          </p>
        )}
        {status.type === 'blocked' && (
          <p className="form__message form__message--error">
            {form.blockedText}{' '}
            <a href={status.link} target="_blank" rel="noopener noreferrer">
              {form.openLinkLabel}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
