import { API_BASE_URL } from '../config.js';
import { getToken } from './storage.js';

export async function http(path, opts={}){
  const { method='GET', body, headers={} } = opts;
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`,{
    method,
    headers:{
      'Content-Type':'application/json',
      ...(token?{Authorization:`Bearer ${token}`}:{ }),
      ...headers
    },
    body: body? JSON.stringify(body): undefined
  });
  if(!res.ok) throw await res.json().catch(()=>({message:res.statusText}));
  return res.json().catch(()=>null);
}
