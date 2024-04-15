import { useEffect, useRef, useState } from "react"
import Avatar from '../../../Assets/Avatar.png'
import Input from "../../Components/Inputs/Input"
import { io } from 'socket.io-client'
import useLogout from "../../hooks/useLogout"
import { BiLogOut } from "react-icons/bi";

const Dashboard = () => {

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
  const [conversation, setConversation] = useState([])
  const [messages, setMessages] = useState({})
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const messageRef = useRef(null)

  useEffect(() => {
    setSocket(io('http://localhost:2020'))
  }, [])

  useEffect(() => {
    socket?.emit('addUser', user?.id)
    socket?.on('getUsers', users => {
    })

    socket?.on('getMessage', data => {
      setMessages(prev => ({
        ...prev,
        messages: [...prev.messages, { user: data.user, message: data.message }]
      }))
    })
  }, [socket])

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages?.messages])

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
    const fetchConversation = async () => {
      const res = await fetch(`http://localhost:2000/api/conversation/${loggedInUser?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const resData = await res.json()
      setConversation(resData)
    }
    fetchConversation()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:2000/api/users/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'aplication/json',
        }
      });
      const resData = await res.json()
      setUsers(resData)
    }
    fetchUsers()
  }, [])

  const fetchMessages = async (conversationId, receiver) => {
    const res = await fetch(`http://localhost:2000/api/message/${conversationId}?$senderId=${user?.id}&&receiverId=${receiver?.receiverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const resData = await res.json()
    setMessages({ messages: resData, receiver, conversationId })
  }

  const sendMessage = async (e) => {
    socket?.emit('sendMessage', {
      conversationId: messages?.conversationId,
      senderId: user?.id,
      message,
      receiverId: messages?.receiver?.receiverId
    })
    const res = await fetch(`http://localhost:2000/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: messages?.conversationId,
        senderId: user?.id,
        message,
        receiverId: messages?.receiver?.receiverId
      })
    });
    setMessage('')
  }

  const logout = useLogout()

  return (
    <div className='flex w-screen h-screen'>
      <div className='sidebar h-screen w-[20%] text-white'>
        <div className="flex flex-col items-start gap-1 py-4 px-2 relative bg-gray-900">
          <h1 className="text-2xl text-purple-400">My Account</h1>
          <div className=" flex items-center justify-center gap-2">
            <div className="rounded-full"><img src={Avatar} height={40} width={40} /></div>
            <div className="">
              <h2 className="">{user?.fullName}</h2>
              <small className="font-light text-gray-400">Active</small>
            </div>
            <button className="btn absolute right-5 flex items-center gap-1 transition-all duration-300 hover:bg-gray-600 text-red-600 p-1.5 pr-2.5 rounded-lg hover:text-gray-200" onClick={() => document.getElementById('my_modal_1').showModal()}><BiLogOut className="text-2xl" /></button>
            <dialog id="my_modal_1" className="modal">
              <div className="modal-box">
                <p className="py-4">Are you sure want to Logout?</p>
                <div className="modal-action">
                  <form method="dialog" className="flex gap-2">
                    <button className="btn">Close</button>
                    <button className="btn text-error bg-error-content" onClick={logout}>Logout</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        </div>
        <div className="py-2 px-3 flex flex-col gap-2">
          <div className="text-white text-lg">Messages</div>
          <div className="">
            {
              conversation.length > 0 ?
                conversation.map(({ conversationId, user }) => {
                  return (
                    <div className="flex flex-col justify-start items-center" key={conversationId}>
                      <div className="cursor-pointer flex items-center gap-2 w-full py-4 px-1 rounded-lg h-full transition-all duration-300 hover:bg-gray-800" onClick={() => fetchMessages(conversationId, user)}>
                        <div className="rounded-full"><img src={Avatar} height={40} width={40} /></div>
                        <div>
                          <h3 className="tracking-wide">{user?.fullName}</h3>
                        </div>
                      </div>
                    </div>
                  )
                }) : <div className="text-center text-lg flex justify-center items-center h-full">No Conversations</div>
            }
          </div>
        </div>
      </div>
      <div className='h-screen w-[58%] py-4 flex flex-col items-center bg-gray-300 chatScreen'>
        {
          messages?.receiver?.fullName &&
          <div className="userChatBar text-white h-[75px] w-[90%] shadow-md shadow-gray-500 z-10 rounded-full flex items-center px-10 gap-2">
            <div className="rounded-full cursor-pointer"><img src={Avatar} height={60} width={40} /></div>
            <div className="mr-auto">
              <h3 className="text-lg">{messages?.receiver?.fullName}</h3>
              <p className="text-sm font-light">{messages?.receiver?.email}</p>
            </div>
            <div className="cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-phone-outgoing" width="26" height="30" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                <path d="M15 9l5 -5" />
                <path d="M16 4l4 0l0 4" />
              </svg>
            </div>
          </div>
        }
        <div className="h-screen w-full overflow-y-auto" >
          <div className="p-4 h-full">
            {
              messages?.messages?.length > 0 ?
                messages.messages.map(({ message, user: { id } = {} }) => {
                  return (
                    <>
                      <div key={user} className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${id === user?.id ? 'bg-green-700 text-white rounded-tl-xl ml-auto' : 'bg-green-100 rounded-tr-xl'}`}>{message}</div>
                      <div ref={messageRef}></div>
                    </>
                  )
                }) : <div className="h-full text-center text-lg flex items-center justify-center">No Messages</div>
            }
          </div>
        </div>
        {
          messages?.receiver?.fullName &&
          <div className="py-3 px-6 bottom-0 w-full flex items-center">
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full">
              <Input isrequired={false} placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-[80%]" inputClassName="p-3 shadow-md rounded-full focus:ring-0 outline-none border-green-700" />
              <div className="flex gap-1">
                <button type="submit" className={`p-2 bg-green-700 rounded-full ${!message && 'pointer-events-none'}`} onClick={() => sendMessage()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send-2 cursor-pointer" width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
                    <path d="M6.5 12h14.5" />
                  </svg>
                </button>
                <label for="file-upload" className="p-2 flex items-center justify-center bg-green-700 cursor-pointer rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-plus cursor-pointer" width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                    <path d="M9 12h6" />
                    <path d="M12 9v6" />
                  </svg>
                </label>
                <input type="file" id="file-upload" className="hidden" />
              </div>
            </form>
          </div>
        }
      </div>
      <div className="sidebarRight text-white w-[22%] h-screen px-3 py-7 overflow-auto flex flex-col gap-2">
        <div className="heading text-2xl text-purple-400"><h1>All Users</h1></div>
        <div className="">
          {
            users.length > 0 ?
              users.map(({ userId, user }) => {
                return (
                  <div className="flex flex-col justify-start items-center" key={userId}>
                    <div className="cursor-pointer flex items-center gap-2 w-full py-4 px-1 rounded-lg h-full transition-all duration-200 hover:bg-gray-800" onClick={() => fetchMessages('new', user)}>
                      <div className="rounded-full"><img src={Avatar} height={40} width={40} /></div>
                      <div>
                        <h3 className="tracking-wide">{user?.fullName}</h3>
                        <p className="text-xs font-thin tracking-wider text-purple-300">{user?.email}</p>
                      </div>
                    </div>
                    {/* <div className="h-1 bg-gray-300 bottom-0"></div> */}
                  </div>
                )
              }) : <div className="text-center text-lg mt-28">No Conversations</div>
          }
        </div>
      </div>
    </div>
  )
}


export default Dashboard