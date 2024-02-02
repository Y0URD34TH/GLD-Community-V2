<script lang="ts">
    import "../css/Settings.scss";
    import { authStore, logout, pb, updateSettings } from "../scripts/Pocketbase"; 
    import { onMount } from "svelte";

    onMount(() => {
        pb.collection("users").authRefresh()

        if (!$authStore.isValid) {
            window.location.href = "/";
        }
    })

    const url = pb.files.getUrl(Object.assign({}, $authStore.model), $authStore.model?.avatar, {
        thumb: "100x100",
    });

    let files: FileList;
    let pfpPreview = url || "https://via.placeholder.com/200x200";

    let settings = {
        username: $authStore.model?.displayName,
        email: $authStore.model?.email,
        desc: $authStore.model?.description || "",
        pfp: $authStore.model?.avatar,
        privateGames: $authStore.model?.private_games,
        hideOnline: $authStore.model?.hide_online,
        hidePlaying: $authStore.model?.hide_playing
    }

    $: if (files) {
        pfpPreview = URL.createObjectURL(files[0]);
        settings.pfp = files[0];
    }
</script>

<div class="center">
    <div id="settings">
        <h1>Settings</h1>

        <div id="pfp">
            <label for="file-input">
                <img src="{pfpPreview}" alt="profile">
            </label>
            <input accept="image/*" type="file" name="pfp" id="file-input" bind:files>

            <div class="toggles">
                <label for="hide-games">
                    <input type="checkbox" id="hide-games" bind:checked={settings.privateGames}>
                    Hide games
                </label>
                <label for="hide-online">
                    <input type="checkbox" id="hide-online" bind:checked={settings.hideOnline}>
                    Hide status
                </label>
                <label for="hide-playing">
                    <input type="checkbox" id="hide-playing" bind:checked={settings.hidePlaying}>
                    Hide currently playing
                </label>
            </div>
        </div>

        <div id="inputs">
            <textarea bind:value={settings.desc} name="desc" cols="30" rows="5" placeholder="Description"/>
            
            <input bind:value={settings.username} type="text" placeholder="Username">

            <input bind:value={settings.email} type="email" placeholder="Email">
        
        </div>

        <div class="btns">
            <button on:click={() => updateSettings(settings)}>Save changes</button>
            <button class="logout" on:click={() => logout()}>Logout</button>
        </div>        
    </div>
</div>