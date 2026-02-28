const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;

    let url = `${API_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const headers = new Headers(init.headers);

    // Auto-inject token if it exists (example logic, adjust based on actual auth storage)
    // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // if (token) {
    //   headers.set('Authorization', `Bearer ${token}`);
    // }

    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      credentials: 'include', // Ensure cookies are sent (critical for localhost:3000 -> localhost:5000)
      ...init,
      headers,
    };

    try {
      const response = await fetch(url, config);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || data.error || 'Something went wrong',
          data
        };
      }

      return data as T;
    } catch (error: any) {
      // Standardize error format
      throw error.message ? error : { message: 'Network error', originalError: error };
    }
  }

  static get<T>(endpoint: string, params?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  static post<T>(endpoint: string, body: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options
    });
  }

  static put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  static patch<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export default ApiClient;
