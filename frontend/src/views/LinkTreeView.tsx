import { useEffect, useState } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput"
import { isValidUrl } from "../utils"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "../api/DevTreeAPI"
import { SocialNetwork, User } from "../types"

export default function LinkTreeView() {
    const [devTreeLinks, setDevTreeLinks] = useState(social)
    
    const queryClient = useQueryClient()
    const user : User = queryClient.getQueryData(['user'])!
    const { mutate } = useMutation({
        mutationFn: updateProfile,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success('Actualizado Correctamente')
        }
    })

    useEffect(()=>{
        const updatedData = devTreeLinks.map( item => {
            const userLink = JSON.parse(user.links).find((link: SocialNetwork) => link.name === item.name)
            if(userLink){
                return {...item, url: userLink.url, enabled: userLink.enabled} 
            }
            return item

        })
        
        setDevTreeLinks(updatedData)
    }, [])

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
        const updateLinks = devTreeLinks.map(link => link.name === e.target.name ? {...link, url: e.target.value} : link)
        console.log(updateLinks)
        setDevTreeLinks(updateLinks)

        queryClient.setQueryData(['user'], (prevData: User)=>{
            return{
                ...prevData,
                links: JSON.stringify(updateLinks)
            }
        })
    }

    const handleEnabledLink = (socialNetwork : string) =>{
        const updateLinks = devTreeLinks.map(link => {
           if (link.name === socialNetwork) {
                if(isValidUrl(link.url)){
                    return {...link, enabled: !link.enabled}
                } else{
                    toast.error('URL no Válida')
                }
           } 
           return link
        })
        setDevTreeLinks(updateLinks)

        queryClient.setQueryData(['user'], (prevData: User)=>{
            return{
                ...prevData,
                links: JSON.stringify(updateLinks)
            }
        })
    }

    return(
        <div className="space-y-5">
            {devTreeLinks.map( item => (
                <DevTreeInput
                  key={item.name}
                  item={item}
                  handleUrlChange={handleUrlChange}
                  handleEnabledLink={handleEnabledLink}
                />
            ))}
            <button
                className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded font-bold"
                onClick={() => mutate(user)}
            >Guardar Cambios</button>
        </div>
    )
}