import test from 'node:test';
import assert from 'node:assert/strict';
import { connectContactForm, submissionContext } from '../contact-form.js';

function fixture() {
  const fields = Object.fromEntries(['name', 'email', 'message', '_gotcha'].map((name) => {
    const field = new EventTarget();
    Object.assign(field, { name, id: `contact-${name}`, value: '', maxLength: name === 'name' ? 120 : name === 'message' ? 3000 : -1, validity: { typeMismatch: false }, attributes: {}, focused: false });
    field.setAttribute = (key, value) => field.attributes[key] = value;
    field.removeAttribute = (key) => delete field.attributes[key];
    field.focus = () => field.focused = true;
    return [name, field];
  }));
  const errors = Object.fromEntries(Object.values(fields).map((field) => [`#${field.id}-error`, { textContent: '' }]));
  const button = { disabled: true, textContent: 'Send message' };
  const status = { textContent: '', dataset: {} };
  let submit;
  const form = {
    elements: { namedItem: (name) => fields[name] },
    querySelector: (selector) => selector.startsWith('button') ? button : selector === '[role="status"]' ? status : errors[selector],
    addEventListener: (event, handler) => { if (event === 'submit') submit = handler; },
    setAttribute() {}, removeAttribute() {},
    reset() { this.resets++; Object.values(fields).forEach((field) => field.value = ''); },
    resets: 0,
  };
  globalThis.window = { location: { href: 'https://d3tech.agency/?utm_source=search#contact', search: '?utm_source=search' } };
  globalThis.document = { referrer: '' };
  connectContactForm(form);
  const send = () => submit({ preventDefault() {} });
  const fill = () => { fields.name.value = 'Connection check'; fields.email.value = 'check@example.test'; fields.message.value = 'Contract verification'; };
  return { fields, errors, button, status, form, send, fill };
}

test('context accepts only permitted URLs and bounded UTM text, without extra browsing data', () => {
  const page = { href: 'https://studio.test/contact?utm_source=search#form', search: `?utm_source=search&utm_campaign=${'x'.repeat(250)}&utm_medium=&other=ignored` };
  const context = submissionContext(page, 'https://referrer.test/path');
  assert.equal(context.landing_page, page.href);
  assert.equal(context.referrer, 'https://referrer.test/path');
  assert.equal(context.utm_campaign.length, 200);
  assert.deepEqual(Object.keys(context).sort(), ['landing_page', 'referrer', 'utm_campaign', 'utm_source']);
  for (const href of ['file:///secret', 'javascript:alert(1)', 'https://user:password@studio.test/', 'https://studio.test/' + 'x'.repeat(2048)]) {
    assert.deepEqual(submissionContext({ href, search: '' }, href), {});
  }
});

test('client validation focuses the first invalid field and never sends incomplete data', async () => {
  const view = fixture();
  globalThis.fetch = () => { throw new Error('Must not send'); };
  await view.send();
  assert.equal(view.fields.name.focused, true);
  assert.equal(view.fields.name.attributes['aria-invalid'], 'true');
  assert.match(view.errors['#contact-name-error'].textContent, /enter your name/);
  view.fill();
  view.fields.email.validity.typeMismatch = true;
  await view.send();
  assert.match(view.errors['#contact-email-error'].textContent, /valid email/);
  view.fields.email.validity.typeMismatch = false;
  view.fields.message.value = 'x'.repeat(3001);
  await view.send();
  assert.match(view.errors['#contact-message-error'].textContent, /3000/);
  view.fields.message.value = '  ';
  await view.send();
  assert.equal(view.form.resets, 0);
});

test('exact payload, publishable headers, duplicate prevention, and success-only reset', async () => {
  for (const code of [201, 202]) {
    const view = fixture(); view.fill();
    view.fields.name.value = '  Connection check  ';
    let resolve, calls = 0;
    globalThis.fetch = (url, options) => {
      calls++;
      assert.equal(url, 'https://d3crm.tech/api/v1/forms/contact-form-ce9edd40/submissions');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.ok(options.headers['X-Form-Key'].startsWith('d3f_'));
      assert.equal(options.credentials, 'omit');
      assert.deepEqual(JSON.parse(options.body), { name: '  Connection check  ', email: 'check@example.test', message: 'Contract verification', _gotcha: '', _context: { landing_page: window.location.href, utm_source: 'search' } });
      return new Promise((done) => resolve = done);
    };
    const pending = view.send();
    assert.equal(view.button.disabled, true);
    await view.send(); assert.equal(calls, 1);
    resolve({ status: code }); await pending;
    assert.equal(view.form.resets, 1);
    assert.equal(view.status.dataset.state, 'success');
    assert.equal(view.button.disabled, false);
  }
});

test('server field errors are accessible, preserve input, and clear without rewriting text', async () => {
  const view = fixture(); view.fill();
  globalThis.fetch = async () => ({ status: 422, json: async () => ({ error: 'Validation failed.', fields: { email: 'Please use another email.', undeclared: 'ignore' } }) });
  await view.send();
  assert.equal(view.fields.email.value, 'check@example.test');
  assert.equal(view.fields.email.focused, true);
  assert.equal(view.fields.email.attributes['aria-invalid'], 'true');
  assert.equal(view.errors['#contact-email-error'].textContent, 'Please use another email.');
  view.fields.email.value = 'new@example.test';
  view.fields.email.dispatchEvent(new Event('input'));
  assert.equal(view.fields.email.value, 'new@example.test');
  assert.equal(view.errors['#contact-email-error'].textContent, '');
  assert.equal(view.fields.email.attributes['aria-invalid'], undefined);
  assert.equal(view.form.resets, 0);
});

test('configuration, rate limits, unexpected responses, malformed errors, and network failures preserve drafts', async () => {
  for (const code of [401, 403, 404, 429, 500, 200, 204, 422, 'network']) {
    const view = fixture(); view.fill();
    globalThis.fetch = async (_url, options) => {
      if (code === 'network') throw new TypeError('offline');
      return { status: code, json: async () => { throw new Error('not JSON'); } };
    };
    await view.send();
    assert.equal(view.form.resets, 0, code);
    assert.equal(view.fields.message.value, 'Contract verification', code);
    assert.equal(view.button.disabled, false, code);
    assert.equal(view.status.dataset.state, 'error', code);
    assert.ok(view.status.textContent.length > 0);
  }
});

test('typing during a request is preserved on success and never receives stale field errors', async () => {
  for (const code of [201, 422]) {
    const view = fixture(); view.fill();
    let resolve;
    globalThis.fetch = () => new Promise((done) => resolve = done);
    const pending = view.send();
    view.fields.email.value = 'edited@example.test';
    resolve({ status: code, json: async () => ({ fields: { email: 'Old email rejected' } }) });
    await pending;
    assert.equal(view.form.resets, 0);
    assert.equal(view.fields.email.value, 'edited@example.test');
    assert.equal(view.errors['#contact-email-error'].textContent, '');
    if (code === 201) assert.match(view.status.textContent, /newer edits/);
  }
});


test('a stalled request aborts and restores the form without resetting the draft', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const view = fixture(); view.fill();
  let signal;
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    signal = options.signal;
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
  const pending = view.send();
  t.mock.timers.tick(20000);
  await pending;
  assert.equal(signal.aborted, true);
  assert.match(view.status.textContent, /timed out/);
  assert.equal(view.form.resets, 0);
  assert.equal(view.fields.message.value, 'Contract verification');
  assert.equal(view.button.disabled, false);
});
