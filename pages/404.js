import React, { Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
    return (
        <Fragment>
            <Head>
                <title>Page not found — 404</title>
                <meta name="robots" content="noindex, follow" />
            </Head>
            <Navbar />
            <section className="wpo-contact-area section-padding" style={{ textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '6rem', marginBottom: '0.5rem' }}>404</h1>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
                        The page you are looking for does not exist.
                    </p>
                    <Link href="/"><a className="theme-btn">Back to home</a></Link>
                </div>
            </section>
            <Footer />
        </Fragment>
    );
};

export default NotFound;
