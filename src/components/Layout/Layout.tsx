import { FC, ReactNode } from 'react'
import { Header } from './Header'
// import { Footer } from './Footer'
import './Layout.css'

interface LayoutProps {
    children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Header />
            <main className="">
                {children}
            </main>
            {/* <Footer /> */}
        </>
    )
}