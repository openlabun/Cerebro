import { createBrowserRouter } from 'react-router-dom'
import App from '../App.jsx'
import HomePage from '../pages/HomePage.jsx'
import SimulationPage from '../pages/SimulationPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'simulacion',
        element: <SimulationPage />,
      },
    ],
  },
])

export default router
