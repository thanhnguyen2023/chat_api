import { customClass } from '@/styles/style';
import React from 'react';
import ImageLazyLoader from '../shared/ImageLazyLoader';

const LoginForm = () => {
    return (
        <div>
           <main className={`${customClass['combo-flex']}`}>
            <div>
                <ImageLazyLoader src='landing-3x.png' alt=''  />
            </div>
            <div></div>
            </main> 
        </div>
    );
};

export default LoginForm;