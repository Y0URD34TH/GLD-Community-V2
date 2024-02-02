export const getGames = async (games: string[]) => {
    let ret = [];

    for (let game of games) {
        const data = await fetch(`https://sgdb-api.vercel.app/api/getgrid/${game}`)
            .then(response => response.json())
        
        ret.push(data.url)
    }

    return ret;
}
