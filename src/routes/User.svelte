<script lang="ts">
    import "../css/User.scss"
    import { getUser, pb, authStore, followUser, unfollowUser } from "../scripts/Pocketbase";
    import Tooltip from "sv-tooltip";
    import { getGames } from "../scripts/SGDB";
    import { writable } from "svelte/store";
    import { onMount, onDestroy } from "svelte";
    import { convertIsoDate, convertDurationToHours } from "../scripts/DateConv"
  import { Link } from "svelte-routing";
    export let user: string | undefined = undefined;

    if (user === undefined) {
        location.href = "/404"
    }

    onMount(() => {
        pb.collection("users").authRefresh()
    })

    onDestroy(() => {
        pb.collection("users").unsubscribe("*")
    })

    let games: any = writable([]);
    let avatar = writable("");
    let playedTime = writable(0);
    let status: any = writable({});
    let followers: any = writable([]);

    // @ts-ignore
    let data: any = getUser(user).then(async (user) => {
        // if the user doesn't have private games enabled, get the grids
        if (!user.private_games) {
            getGames(user.games.map((game: { name: any; }) => game.name)).then((g) => {
                games.set(g);
            });
        } else {
            games.set([ "" ]);
        }

        // set current status
        status.set(user);

        // subscribe to the user table
        pb.collection("users").subscribe(user.id, (event) => {
            // if it updates then update the status
            if (event.action === "update") {
                pb.collection("users").getOne(user.id).then((u) => {
                    status.set(u);
                })
            }
        })

        // query for the followers using following.username ?= user.username
        let followerList = await pb.collection("users").getFullList({
            filter: `following.username ?= "${user.username}"`,
        })

        followers.set(followerList)

        // set avatar
        const url = pb.files.getUrl(Object.assign({}, user), user.avatar, {
            thumb: "100x100",
        });

        avatar.set(url);

        // go through every game.playedTime and sum it up, playedTime is stored as Nd Nh Nm Ns, use Reduce
        let resTime: number[] = [];

        user.games.forEach((game: { playedTime: any; }) => {
            let time = convertDurationToHours(game.playedTime || "0d 0h 0m 0s");
            
            if (time === undefined) return;
            resTime.push(time)
        });

        playedTime.set(resTime.reduce((a: number, b: number) => a + b, 0));

        // return the user
        return user;
    });

    const isEmpty = (string: string) => {
        return string === undefined || string.length === 0 || !string.trim();
    }

</script>

<div id="flex">
    {#if $games.length > 0}
        {#await data then user}
            <div id="user-page">
                <div id="header">
                    <div id="avatar">
                        <img src="{$avatar || "https://via.placeholder.com/200x200"}" alt="">

                        <span id=info>
                        {#if $status.is_online && !$status.hide_playing }
                            <p id="online">{user.displayName}</p>
                        {:else}
                            <p>{user.displayName}</p>
                        {/if}

                        <p id="desc">
                            {user.description}
                        </p>

                        {#if !user.private_games && !$status.hide_playing}
                            <p id="desc">{
                                isEmpty($status.currently_playing) ? "Not playing anything" :
                                "Playing " + $status.currently_playing
                            }</p>
                        {/if}
                        </span>
                   
                        {#if $authStore.isValid && 
                             $authStore.model?.id !== user.id &&
                             !$authStore.model?.following.includes(user.id)}
                            <button on:click={() => followUser(user.id)} id="follow">
                                Follow user
                            </button>

                        {:else if $authStore.isValid
                             && $authStore.model?.id !== user.id}
                            <button on:click={() => unfollowUser(user.id)} id="follow">
                                Unfollow user
                            </button>
                        {/if}
                    </div>
                </div>
                
                <div class="bottom">
                {#if !user.private_games}
                    <div class="recent">
                        <span id="info">
                            {#if navigator.userAgent.includes("ProjectGLD")}
                                <p id="small-n">{user.games.length} games in library</p>
                                <p id="time" class="small">{$playedTime} hours played in total</p>
                            {:else}
                                <p>{user.games.length} games in library</p>
                                <!-- loop through all games and get the total time played -->
                                <p id="time">{$playedTime} hours played in total</p>
                            {/if}
                        </span>
                        <div id="games">
                            {#each user.games as game, i}
                                <!-- set height of #game based on height of #info -->
                                <div id="game" class={navigator.userAgent.includes("ProjectGLD") ? "small" : ""}
                                >
                                    <div id="separator">
                                        {#if navigator.userAgent.includes("ProjectGLD")}
                                            <img id="small" src="{$games[i] || "https://via.placeholder.com/920x430"}" alt="game">
                                        {:else}
                                            <img src="{$games[i] || "https://via.placeholder.com/920x430"}" alt="game">
                                        {/if}

                                        <!-- set height of #game based on height of #info -->
                                        <span id="info" class={navigator.userAgent.includes("ProjectGLD") ? "small" : ""} >
                                            {#if navigator.userAgent.includes("ProjectGLD")}
                                                <p id="small-n">{game.name}</p>
                                                <p id="time" class="small">Time played: {convertDurationToHours(game.playedTime || "") + " hour(s)"} played</p>
                                                <p id="time" class="small">Last played: {convertIsoDate(game.LastPlayed) || "Never"}</p> 
                                            {:else}
                                                <p>{game.name}</p>
                                                <p id="time">Time played: {convertDurationToHours(game.playedTime || "") + " hour(s)"} played</p>
                                                <p id="time">Last played: {convertIsoDate(game.LastPlayed) || "Never"}</p> 
                                            {/if}
                                        </span>
                                    </div>

                                    {#if game.lockedachievements.length + game.unlockedachievements.length !== 0}
                                        <div id="ach-separator" class={navigator.userAgent.includes("ProjectGLD") ? "small" : ""}>
                                            <span id="text">
                                                <b>Achievement Progress</b>
                                                {game.unlockedachievements.length}/{game.lockedachievements.length}
                                            </span>

                                            <progress 
                                                value={game.unlockedachievements.length} 
                                                max={game.lockedachievements.length + game.unlockedachievements.length}
                                            />

                                            <Link to="/nuh-uh">
                                                <span id="ach" class={navigator.userAgent.includes("ProjectGLD") ? "small" : ""}>
                                                    {#each game.unlockedachievements.slice(0, 4) as unlAch}
                                                        <Tooltip tip={unlAch.displayName} color="#141414" top>
                                                            <img
                                                                src={unlAch.icon} 
                                                                alt={`${unlAch.displayName}; ${unlAch.description}`} 
                                                                class="ach-icon"
                                                            >
                                                        </Tooltip>
                                                    {/each}
                                                </span>
                                            </Link>

                                            <span id="text" class="plus">
                                                {#if game.unlockedachievements.length > 4}
                                                    +{game.unlockedachievements.length - 4}
                                                {/if}
                                            </span>


                                            <!-- <span id="ach" class={navigator.userAgent.includes("ProjectGLD") ? "small" : ""}>
                                                {#each game.lockedachievements as lockAch, i}
                                                    {#if i < 6}
                                                        <img src={lockAch.icongray} alt={`${lockAch.displayName}; ${lockAch.description}`} class="ach-icon">    
                                                    {/if}
                                                {/each}
                                            </span>  -->
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <div class="followers">
                    {#if navigator.userAgent.includes("ProjectGLD")}
                        <span id="small-n">{$followers.length} followers</span>
                    {:else}
                        <span>{user.displayName}'s followers</span>
                    {/if}

                    {#if $followers.length > 0}
                        {#each $followers as follower}
                            <a href={"/u/" + follower.username } class="follower">
                                <img src="{
                                    pb.files.getUrl(Object.assign({}, follower), follower.avatar, {
                                        thumb: "100x100",
                                    })
                                }" alt="{follower.displayName}">

                                <span id="info">
                                    {#if follower.is_online}
                                        <p id="online">{follower.displayName}</p>
                                    {:else}
                                        <p>{follower.displayName}</p>
                                    {/if}

                                    <p id="tag">/u/{follower.username}</p>
                                </span>
                            </a>
                        {/each}
                    {:else}
                        <p>No followers :(</p>
                    {/if}
                </div>
                </div>
            </div>
        {/await}
    {:else}
        <h1>Loading...</h1>
    {/if}
</div>