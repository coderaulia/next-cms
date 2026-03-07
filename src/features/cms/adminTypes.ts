export type AdminSessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type AdminAuthResponse = {
  ok: true;
  user: AdminSessionUser;
};

export type AdminErrorResponse = {
  error: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};
