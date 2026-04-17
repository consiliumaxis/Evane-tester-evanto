import React, { Component } from 'react'
import Link from 'next/link'


const menus = [
    { id: 2, title: 'About', link: '#about' },
    { id: 3, title: 'Portfolio', link: '#portfolio' },
    { id: 4, title: 'Contact', link: '#contact' },
]


export default class MobileMenu extends Component {

    state = {
        isMenuShow: false,
    }

    menuHandler = () => {
        this.setState({
            isMenuShow: !this.state.isMenuShow,
        })
    }

    render() {
        const { isMenuShow } = this.state;

        return (
            <div>
                <div className={`mobileMenu ${isMenuShow ? 'show' : ''}`}>
                    <ul className="responsivemenu">
                        {menus.map(item => (
                            <li key={item.id}>
                                <Link href={item.link}>{item.title}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="showmenu" onClick={this.menuHandler}>
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </div>
            </div>
        )
    }
}
