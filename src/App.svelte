<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import { SearchOutline, SettingsOutline } from "svelte-ionicons";
  import { authStore, pb } from "./scripts/Pocketbase"; 
  import Home from "./routes/Home.svelte";
  import Search from "./routes/Search.svelte";
  import User from "./routes/User.svelte";
  import Settings from "./routes/Settings.svelte"
</script>

<Router>
  <nav>
    <Link to="/search"> 
      <img id="logo" src="/gld-logo.png" alt="logo"/>
    </Link>

    <div class="right">
      <Link to="/search">
        <SearchOutline id="search-icon" size="32" />
      </Link>

      {#if $authStore.isValid}
        <Link to="/settings">
          <SettingsOutline id="settings-icon" size="32" />        
        </Link>

        <Link to="/u/{$authStore.model?.username}">
          <img id="avatar" src="{
            pb.files.getUrl(
              Object.assign({}, $authStore.model),
              $authStore.model?.avatar,
              { thumb: "100x100" },  
            )
            || 'https://via.placeholder.com/200x200'}" alt="avatar"/>
        </Link>
      {/if}
    </div>
  </nav>
  <div>
    <Route path="/" component={Home} />
    <Route path="/search" component={Search} />
    <Route path="/u/:user" let:params>
      <User user="{params.user}"/>
    </Route>
    <Route path="/settings" component={Settings}/>
  </div>
</Router>