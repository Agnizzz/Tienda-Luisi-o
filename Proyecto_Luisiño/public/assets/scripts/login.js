function validarLogin(event) {
    event.preventDefault();

    const USUARIO_CORRECTO = "admin";
    const CLAVE_SECRETA = "ok";

    const usuarioInput = document.getElementById("usuario").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    if (
        usuarioInput.toLowerCase() === USUARIO_CORRECTO &&
        passwordInput === CLAVE_SECRETA
    ) {
        alert("Login exitoso");
        window.location.href = "inicio.html";
    } else {
        alert("Usuario o contraseña incorrectos");
        document.getElementById("password").value = "";
    }

    return false;
}
