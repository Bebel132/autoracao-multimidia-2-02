const api = (() => {
  const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
  };

  async function request(url, options = {}) {
    try {
      const response = await fetch("http://localhost:5000" + url, {
        ...options,
        headers: {
          ...DEFAULT_HEADERS,
          ...(options.headers || {}),
        },
      });

      const contentType = response.headers.get("content-type");
      const hasJson = contentType && contentType.includes("application/json");

      const data = hasJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw {
          data,
        };
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  return {
    get: (url, config = {}) =>
      request(url, {
        method: "GET",
        ...config,
      }),

    post: (url, body, config = {}) =>
      request(url, {
        method: "POST",
        body: JSON.stringify(body),
        ...config,
      }),

    delete: (url, config = {}) =>
      request(url, {
        method: "DELETE",
        ...config,
      }),
  };
})();

export default api;
