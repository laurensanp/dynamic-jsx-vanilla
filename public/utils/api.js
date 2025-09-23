import * as ApiSettings from "../settings/apiSettings.js";

export async function request(method, url, options = {}) {
  const {
    body = null,
    headers = {},
    credentials = ApiSettings.DEFAULT_FETCH_CREDENTIALS,
    cache = ApiSettings.DEFAULT_FETCH_CACHE,
  } = options;

  const init = {
    method,
    headers: { ...headers },
    credentials,
    cache,
  };

  if (body != null) {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      if (!init.headers['Content-Type']) init.headers['Content-Type'] = ApiSettings.DEFAULT_CONTENT_TYPE_JSON;
      init.body = init.headers['Content-Type'].includes(ApiSettings.DEFAULT_CONTENT_TYPE_JSON) ? JSON.stringify(body) : body;
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
    
    return {
      ok: false,
      status: 500,
      statusText: 'Network error',
      data: null,
      headers: {},
    };
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