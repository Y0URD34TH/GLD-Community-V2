<script lang="ts">
    import "../css/Search.scss";
    import { SearchOutline } from "svelte-ionicons";
    import { queryUser, pb } from "../scripts/Pocketbase";
    import { writable } from "svelte/store";

    let query: string;
    let users: any = writable([]);
</script>

<div class="center">
    <div id="center">
        <div id="search-box">
            <input bind:value={query} type="text" placeholder="Search...">
            <button on:click={() => queryUser(query).then((user) => {
                users.set(user)
            })}>
                <SearchOutline size="32" />
            </button>
        </div>

        {#if $users.length > 0}
            {#each $users as user}
                <a class="user-wrap" href={`/u/${user.username}`}>
                    <div class="user">
                        <img src="{
                            pb.files.getUrl(
                                Object.assign({}, user),
                                user.avatar,
                            ) || "https://via.placeholder.com/200x200"
                        }" alt="{user.username}" />

                        <span id="info">
                            <span id="name">{user.displayName}</span>
                            <span id="tag">/u/{user.username}</span>
                            <p>{user.description}</p>
                        </span>
                    </div>   
                </a>
            {/each}
        {/if}
    </div>
</div>