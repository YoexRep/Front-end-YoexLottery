
import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"

export default function LotterEntrace(){
    
 

    //Saco la variable chainId y la renombro como hex ya que viene en formato hexadecimal
    const {chainId: chainIdHex, isWeb3Enabled} = useMoralis()

    const chainId = parseInt(chainIdHex)
  
   
 
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    

     const [entranceFee, setEntranceFee] = useState("0")
     const [numPlayers, setNumPlayers] = useState("0")
     const [listadoGanadores, setListadoGanadores] = useState([])
     const [numeroJugado, setNumeroJugado] = useState("0");

     const [numGanador, setNumGanador] = useState("0")

     const [listadoJugadores, setListadoJugadores] = useState([]);
     const [numJugados, setNumJugados] = useState([]);
     
     
     const dispatch = useNotification()

     
  const handleNumeroJugado = (event) => {

    setNumeroJugado(event.target.value);
  };


    //Pero para saber el valor debemos llamar otra funcion de nuestro backend, para eso haremos uso de nuestro getterEntrafee

    const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress , // Hay que especificar el networdid para eso la variable raffleaddress
        functionName: "getEntranceFee",
        params: {},
  

    })

  

    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress , // Hay que especificar el networdid para eso la variable raffleaddress
        functionName: "enterRaffle",
        params: {numeroJugado},
        msgValue: entranceFee,

    }) 


    const {runContractFunction: getNumberOfPlayers} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getNumberOfPlayers",
        params: {},
  

    })

    

    const {runContractFunction: getListadoJugadores} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getListadoJugadores",
        params: {},
  

    })

    const {runContractFunction: getListadoDeGanadores} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getListadoDeGanadores",
        params: {},
  

    })

    const {runContractFunction: getNumerosJugados} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getNumerosJugados",
        params: {},
  

    })



    const {runContractFunction: getNumeroGanador} = useWeb3Contract({
        abi: abi,
        contractAddress:raffleAddress ,
        functionName: "getNumeroGanador",
        params: {},
  

    })

    async function UpdateUI (){
        const EntranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(EntranceFeeFromCall)

        const NumPlayersFromCall = (await getNumberOfPlayers()).toString()
        setNumPlayers(NumPlayersFromCall)

        const listadoJugadores = (await getListadoJugadores()).toString()
        setListadoJugadores(listadoJugadores)

         

         const getNumerosJugadosFromCall = (await getNumerosJugados()).toString()
         setNumJugados(getNumerosJugadosFromCall)


        
         
    
    }

    //Para el msgvalue usaremos un hoock para saber que valor enviamos, en nuestra entrada
    
    useEffect(() => {

        if(isWeb3Enabled){
            //Si esta enable, que intente leer el valor digitado

          
            
           
            UpdateUI()

            UpdateRecentWinner()
         
        }
       

    }, [isWeb3Enabled, numPlayers, numJugados, numGanador, listadoGanadores])


        

    async function UpdateRecentWinner (){
        

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const contractFromSuscription = new ethers.Contract(raffleAddress, abi, signer)

          contractFromSuscription.on("WinnerPicked", (WinnerPicked)=> {
          
            setRecentWinner(WinnerPicked);
          })

          const recentNumeroGanadorFromCall = (await getNumeroGanador()).toString()
          setNumGanador(recentNumeroGanadorFromCall)

          const listadoGanadores = (await getListadoDeGanadores()).toString()
          setListadoGanadores(listadoGanadores)
    
    }


    const handleSuccess = async  function(tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        UpdateUI()
    }

    const handleNewNotification = function(){
        dispatch({
            type:"info",
            message:"Transaccion complete",
            title: "tx notifacion",
            position: "topR",
            icon: "bell",
        })
    }

    return(
        <div className="p-5">

            
       
            

            {raffleAddress ? 
            
            <div>
                
                 <label>Número jugado del (0 al 99):   </label>   
                <input type="text" value={numeroJugado} maxLength="2" onChange={handleNumeroJugado} className="mt-1  px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
      disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
      invalid:border-pink-500 invalid:text-pink-600
      focus:invalid:border-pink-500 focus:invalid:ring-pink-500
    " />
                <button onClick={async function(){await enterRaffle({

                        
                            //Oncomplete:
                            onSuccess: handleSuccess,
                            onError: (error) => console.log(error),

                })}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"  disabled={isLoading || isFetching}>


                {isLoading || isFetching ?  <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"> </div> : <div>Comprar billete</div>}
                
                
                
                </button>


       

                <div>   Estos son las direcciones de los jugadores: <br></br> {listadoJugadores}</div>
            
                <div>   Esto son los numeros jugados: <br></br> {numJugados} </div>
                <div><br></br><br></br>  --------------------------------- </div>
                <div>Resultados: </div>
           
                <div>   Numero Ganador: <br></br> {numGanador} </div>
                <div>   Ganadores: <br></br> {listadoGanadores} </div>
                
                
                
            </div> 
            
            : <div>No se detecto una raffle address usar la hardhat blockchain</div>}

        </div>

    )
}