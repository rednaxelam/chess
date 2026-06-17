import { createBrowserRouter, RouterProvider } from 'react-router'
import AppLayout from './components/AppLayout'
import Home from './components/pages/Home'
import LocalGame from './components/pages/LocalGame'
import OnlineHome from './components/pages/OnlineHome'
import OnlineGame from './components/pages/OnlineGame'


const router = createBrowserRouter([
  {
    // the code currently assumes that every route will have AppLayout as a parent, and that AppLayout will never be unmounted
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/local-game', element: <LocalGame /> },
      { path: '/online', element: <OnlineHome /> },
      { path: '/online/active-game', element: <OnlineGame /> }
    ]
  }
])


function App() {
  return <RouterProvider router={router} />
}

export default App
