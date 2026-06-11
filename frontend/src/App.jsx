import { createBrowserRouter, RouterProvider } from 'react-router'
import AppLayout from './components/AppLayout'
import Home from './components/pages/Home'
import LocalGame from './components/pages/LocalGame'


const router = createBrowserRouter([
  {
    // the code currently assumes that every route will have AppLayout as a parent, and that AppLayout will never be unmounted
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/local-game', element: <LocalGame /> }
    ]
  }
])


function App() {
  return <RouterProvider router={router} />
}

export default App
