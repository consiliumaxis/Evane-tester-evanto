import React from 'react'
import Link from 'next/link'

const Footer = (props) => {
    const year = new Date().getFullYear();
    return (
        <div className={`wpo-footer-area ${props.Ftclass || ''}`}>
            <div className="container">
                <div className="wpo-footer-top">
                    <div className="row">
                        <div className="col-lg-2 col-md-3 col-sm-3 col-12">
                            <div className="footer-logo">
                                <img src='images/logo.png' alt="Logo" />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-9 col-sm-9 col-12">
                            <div className="wpo-footer-menu">
                                <ul>
                                    <li><Link href="#about">About</Link></li>
                                    <li><Link href="#portfolio">Portfolio</Link></li>
                                    <li><Link href="#contact">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`wpo-footer-bottom ${props.Fbclass || ''}`}>
                <span>© {year} <Link href="/">Follio</Link>. All rights reserved</span>
            </div>
        </div>
    )
}

export default Footer;
