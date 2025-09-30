
import { useOutletContext } from "react-router-dom"
import { StationPreview } from "./StationPreview"


export function HomePage() {

const {stations} = useOutletContext()



if (!stations) return <>loading...</>
    return (
        <section className="home">
            
            <h1>Home sweet Home </h1>
    {stations.map(station =>
                   <li key={station._id}>
                       {station.title}
                   </li>)
               }
        </section >
    )
}

