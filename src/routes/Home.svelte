<script lang="ts">
  import { onMount } from "svelte";
    import { authStore, login, register, logout } from "../scripts/Pocketbase";

    let loginObj = {
        email: "",
        password: ""
    }

    let registerObj = {
        email: "",
        password: "",
        username: ""
    }

    onMount(() => {
        if ($authStore.isValid) {
            location.href = "/search"
        }
    })
</script>

<div class="center">
    <div class="login">
        <span>Login</span>
        <input bind:value={loginObj.email} type="text" placeholder="Email">
        <input bind:value={loginObj.password} type="password" placeholder="Password">
        <button on:click={() => login(loginObj).then(() => loginObj = {email: "", password: ""})} >Login</button>
    </div>
   
    <div class="register">
        <span>or Register</span>
        <input bind:value={registerObj.username} type="text" placeholder="Username">
        <input bind:value={registerObj.email} type="text" placeholder="Email">
        <input bind:value={registerObj.password} type="password" placeholder="Password">
        <button on:click={() => register(registerObj).then(() => registerObj = {email: "", password: "", username: ""})}>Register</button>
    </div>
</div>