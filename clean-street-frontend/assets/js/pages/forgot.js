import { http } from "../../assets/js/utils/http.js";
const form = document.querySelector("#forgotForm");
form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  try{ await http('/auth/forgot',{method:'POST',body:{ email: form.email.value }}); alert("Check your email"); }
  catch(err){ alert(err.message || "Error"); }
});
