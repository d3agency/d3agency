const endpoint = 'https://d3crm.tech/api/v1/forms/contact-form-ce9edd40/submissions';
const formKey = 'd3f_rOWnwVkygDfm90VdufjWN6UeaKLLebrM';
const fieldIds = ['name', 'email', 'message'];

export function submissionContext(page, referrer) {
  const context = {};
  for (const [key, value] of [['landing_page', page.href], ['referrer', referrer]]) {
    try {
      const url = new URL(value);
      if (value.length <= 2048 && ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) context[key] = value;
    } catch { /* Omit empty or invalid context URLs. */ }
  }
  const params = new URLSearchParams(page.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) context[key] = value.slice(0, 200);
  }
  return context;
}

export function connectContactForm(form) {
  const fields = fieldIds.map((id) => form.elements.namedItem(id));
  const honeypot = form.elements.namedItem('_gotcha');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[role="status"]');
  let pending = false;

  function fieldError(field, message = '') {
    form.querySelector(`#${field.id}-error`).textContent = message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }

  function validate(field) {
    let message = '';
    if (!field.value.trim()) message = field.name === 'message' ? 'Please tell me a little about your idea.' : `Please enter your ${field.name === 'name' ? 'name' : 'email address'}.`;
    else if (field.validity.typeMismatch) message = 'Please enter a valid email address.';
    else if (field.maxLength > 0 && field.value.length > field.maxLength) message = `Please use ${field.maxLength} characters or fewer.`;
    fieldError(field, message);
    return !message;
  }

  for (const field of fields) {
    field.addEventListener('blur', () => validate(field));
    // Leave values and selection entirely to the browser, including IME and undo.
    field.addEventListener('input', () => fieldError(field));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    status.textContent = '';
    status.dataset.state = '';
    const valid = fields.map(validate);
    if (valid.includes(false)) {
      status.textContent = 'Please check the highlighted fields.';
      status.dataset.state = 'error';
      fields[valid.indexOf(false)].focus();
      return;
    }

    const payload = Object.fromEntries(fields.map((field) => [field.name, field.value]));
    payload._gotcha = honeypot.value;
    payload._context = submissionContext(window.location, document.referrer);
    pending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Form-Key': formKey },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit',
      });
      if (response.status === 201 || response.status === 202) {
        const unchanged = [...fields, honeypot].every((field) => field.value === payload[field.name]);
        if (unchanged) form.reset();
        fields.forEach((field) => fieldError(field));
        status.dataset.state = 'success';
        status.textContent = unchanged ? 'Thanks! Your message is sent. I’ll be in touch.' : 'Thanks! Your message is sent. Your newer edits are still here.';
      } else if (response.status === 422) {
        const body = await response.json().catch(() => ({}));
        let firstInvalid;
        for (const field of fields) {
          const message = body?.fields?.[field.name];
          if (typeof message === 'string' && field.value === payload[field.name]) {
            fieldError(field, message);
            firstInvalid ??= field;
          }
        }
        status.dataset.state = 'error';
        status.textContent = firstInvalid ? 'Please check the highlighted fields and send again.' : 'Your message couldn’t be accepted. Please check your details and try again, or email me below.';
        firstInvalid?.focus();
      } else {
        status.dataset.state = 'error';
        status.textContent = [401, 403, 404].includes(response.status)
          ? 'This form is temporarily unavailable. Please email me below.'
          : response.status === 429
            ? 'Too many attempts. Please wait a minute before trying again.'
            : 'Your message couldn’t be sent. Please try again, or email me below.';
      }
    } catch {
      status.dataset.state = 'error';
      status.textContent = controller.signal.aborted
        ? 'The request timed out. Delivery couldn’t be confirmed. Please email me below if needed.'
        : 'Connection lost. Delivery couldn’t be confirmed. Please check your connection or email me below.';
    } finally {
      clearTimeout(timeout);
      pending = false;
      button.disabled = false;
      button.textContent = 'Send message';
      form.removeAttribute('aria-busy');
    }
  });
  form.noValidate = true;
  button.disabled = false;
}
