import React from 'react'


const PorfolioSectionHome = () => {
    const items = [
        { img: 'images/protfolio/img-5.jpg', title: 'Minimalism', tag: 'Illustration . Art Direction' },
        { img: 'images/protfolio/img-6.jpg', title: 'Abstract Art', tag: 'Illustration . Art Direction' },
        { img: 'images/protfolio/img-7.jpg', title: '3D Project', tag: 'Illustration . Art Direction' },
        { img: 'images/protfolio/img-8.jpg', title: 'Modern BG', tag: 'Illustration . Art Direction' },
    ];

    return (
        <div className="wpo-protfolio-area-2 wpo-protfolio-area-s1 section-padding">
            <div className="container">
                <div className="col-12">
                    <div className="section-title text-center">
                        <h2>Portfolio</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="wpo-protfolio-item">
                            <div className="row">
                                {items.map((it) => (
                                    <div key={it.title} className="col-lg-6 col-md-6 col-sm-12 custom-grid">
                                        <div className="wpo-protfolio-single">
                                            <div className="wpo-protfolio-img">
                                                <img src={it.img} alt={it.title} />
                                            </div>
                                            <div className="wpo-protfolio-text">
                                                <h2>{it.title}</h2>
                                                <span>{it.tag}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PorfolioSectionHome;
