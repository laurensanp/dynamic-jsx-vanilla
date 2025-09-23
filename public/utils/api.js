import { DEFAULT_FETCH_CREDENTIALS, DEFAULT_FETCH_CACHE, DEFAULT_CONTENT_TYPE_JSON } from "../settings/apiSettings.js";

export async function request(method, url, options = {}) {
  const {
    body = null,
    headers = {},
    credentials = DEFAULT_FETCH_CREDENTIALS,
    cache = DEFAULT_FETCH_CACHE,
  } = options;

  const init = {
    method,
    headers: { ...headers },
    credentials,
    cache,
  };

  if (body != null) {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      if (!init.headers['Content-Type']) init.headers['Content-Type'] = DEFAULT_CONTENT_TYPE_JSON;
      init.body = init.headers['Content-Type'].includes(DEFAULT_CONTENT_TYPE_JSON) ? JSON.stringify(body) : body;
    } else {
      init.body = body;
    }
  }

  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      data,
      headers: res.headers,
    };
  } catch (error) {
    
    throw new Error(error.message || 'Network error');
  }
}

export function get(url, options = {}) {
  return request('GET', url, options);
}

export function post(url, body = null, options = {}) {
  return request('POST', url, { ...options, body });
}

export function put(url, body = null, options = {}) {
  return request('PUT', url, { ...options, body });
}

export function del(url, options = {}) {
  return request('DELETE', url, options);
}