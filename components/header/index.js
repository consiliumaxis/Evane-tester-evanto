import React from 'react'
import Link from 'next/link'
import MobileMenu from '../../components/MobileMenu'


const Header = () => {
    return (
        <div className="header-style-1">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <img src='images/logo.png' alt="Logo" />
                    </div>
                    <nav className="d-lg-block d-none header-b">
                        <ul>
                            <li><Link href="#about" title="About">About</Link></li>
                            <li><Link href="#portfolio" title="Portfolio">Portfolio</Link></li>
                            <li><Link href="#contact" title="Contact">Contact</Link></li>
                        </ul>
                    </nav>
                    <div className="contact">
                        <div className="cart-search-contact">
                            <Link href="#contact"><a className="theme-btn">Lets Talk</a></Link>
                        </div>
                    </div>
                    <div className="clearfix"></div>
                </div>
                <MobileMenu />
            </div>
        </div>
    )
}

export default Header;
