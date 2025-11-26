import React from 'react';
import { MrzResult } from '../types';

interface CharProps {
    c: string;
    variant?: 'base' | 'iss' | 'name' | 'doc' | 'nat' | 'dob' | 'exp' | 'opt' | 'filler' | 'check';
    valid?: boolean;
}

const Char: React.FC<CharProps> = ({ c, variant = 'base', valid }) => {
    let className = "inline-block w-[1ch] text-center ";
    switch (variant) {
        case 'base': className += "text-white"; break;
        case 'iss': className += "text-teal-400 font-bold"; break;
        case 'name': className += "text-amber-400 font-bold"; break;
        case 'doc': className += "text-violet-400 font-bold"; break;
        case 'nat': className += "text-blue-400 font-bold"; break;
        case 'dob': className += "text-pink-400 font-bold"; break;
        case 'exp': className += "text-red-400 font-bold"; break;
        case 'opt': className += "text-lime-400 font-bold"; break;
        case 'filler': className += "text-gray-600"; break;
        case 'check': className += valid ? "bg-emerald-800 text-white font-bold px-[1px]" : "bg-red-800 text-white font-bold underline px-[1px]"; break;
    }
    return <span className={className}>{c}</span>;
};

interface Props {
    data: MrzResult;
}

export const MrzVisualizer: React.FC<Props> = ({ data }) => {
    if (data.type === 'UNKNOWN') return <div className="bg-[#1e1e1e] p-4 font-mono text-sm text-gray-500">WAITING FOR DATA...</div>;

    // --- CN CARD RENDERER (Single Line 30 chars) ---
    const renderCNCard = () => (
        <div className="flex">
            {/* CS(2) Doc(9) C(1) <(1) Exp(6) C(1) <(1) Dob(6) C(1) <(1) Final(1) */}
            {[...data.rawLines[0]].map((c, i) => {
                if (i < 2) return <Char key={i} c={c} variant="iss" />;
                if (i < 11) return <Char key={i} c={c} variant="doc" />;
                if (i === 11) return <Char key={i} c={c} variant="check" valid={data.validations.documentNumber} />;
                if (i < 13) return <Char key={i} c={c} variant="filler" />;
                if (i < 19) return <Char key={i} c={c} variant="exp" />;
                if (i === 19) return <Char key={i} c={c} variant="check" valid={data.validations.expiryDate} />;
                if (i < 21) return <Char key={i} c={c} variant="filler" />;
                if (i < 27) return <Char key={i} c={c} variant="dob" />;
                if (i === 27) return <Char key={i} c={c} variant="check" valid={data.validations.birthDate} />;
                if (i < 29) return <Char key={i} c={c} variant="filler" />;
                if (i === 29) return <Char key={i} c={c} variant="check" valid={data.validations.composite} />;
                return null;
            })}
        </div>
    );

    // --- TD1 RENDERER (3 lines) ---
    const renderTD1 = () => (
        <>
            <div className="flex">
                {/* L1: Type(2) Iss(3) Doc(9) C(1) Opt1(15) */}
                {[...data.rawLines[0]].map((c, i) => {
                    if (i < 2) return <Char key={i} c={c} variant="iss" />;
                    if (i < 5) return <Char key={i} c={c} variant="iss" />;
                    if (i < 14) return <Char key={i} c={c} variant="doc" />;
                    if (i === 14) return <Char key={i} c={c} variant="check" valid={data.validations.documentNumber} />;
                    return <Char key={i} c={c} variant={c === '<' ? 'filler' : 'opt'} />;
                })}
            </div>
            <div className="flex">
                {/* L2: Dob(6) C(1) Sex(1) Exp(6) C(1) Nat(3) Opt2(11) Final(1) */}
                {[...data.rawLines[1]].map((c, i) => {
                    if (i < 6) return <Char key={i} c={c} variant="dob" />;
                    if (i === 6) return <Char key={i} c={c} variant="check" valid={data.validations.birthDate} />;
                    if (i === 7) return <Char key={i} c={c} variant="base" />;
                    if (i < 14) return <Char key={i} c={c} variant="exp" />;
                    if (i === 14) return <Char key={i} c={c} variant="check" valid={data.validations.expiryDate} />;
                    if (i < 18) return <Char key={i} c={c} variant="nat" />;
                    if (i < 29) return <Char key={i} c={c} variant={c === '<' ? 'filler' : 'opt'} />;
                    if (i === 29) return <Char key={i} c={c} variant="check" valid={data.validations.composite} />;
                    return null;
                })}
            </div>
            <div className="flex">
                 {/* L3: Name(30) */}
                 {[...data.rawLines[2]].map((c, i) => <Char key={i} c={c} variant={c === '<' ? 'filler' : 'name'} />)}
            </div>
        </>
    );

    // --- TD2 RENDERER (2 lines x 36) ---
    const renderTD2 = () => (
         <>
            <div className="flex">
                {/* L1: Type(2) Iss(3) Name(31) */}
                {[...data.rawLines[0]].map((c, i) => {
                    if (i < 2) return <Char key={i} c={c} variant="iss" />;
                    if (i < 5) return <Char key={i} c={c} variant="iss" />;
                    return <Char key={i} c={c} variant={c === '<' ? 'filler' : 'name'} />;
                })}
            </div>
            <div className="flex">
                {/* L2: Doc(9) C(1) Nat(3) Dob(6) C(1) Sex(1) Exp(6) C(1) Opt(7) Final(1) */}
                {[...data.rawLines[1]].map((c, i) => {
                    if (i < 9) return <Char key={i} c={c} variant="doc" />;
                    if (i === 9) return <Char key={i} c={c} variant="check" valid={data.validations.documentNumber} />;
                    if (i < 13) return <Char key={i} c={c} variant="nat" />;
                    if (i < 19) return <Char key={i} c={c} variant="dob" />;
                    if (i === 19) return <Char key={i} c={c} variant="check" valid={data.validations.birthDate} />;
                    if (i === 20) return <Char key={i} c={c} variant="base" />;
                    if (i < 27) return <Char key={i} c={c} variant="exp" />;
                    if (i === 27) return <Char key={i} c={c} variant="check" valid={data.validations.expiryDate} />;
                    if (i < 35) return <Char key={i} c={c} variant={c === '<' ? 'filler' : 'opt'} />;
                    if (i === 35) return <Char key={i} c={c} variant="check" valid={data.validations.composite} />;
                    return null;
                })}
            </div>
         </>
    );

    // --- TD3 RENDERER (Existing) ---
    const renderTD3 = () => (
         <>
            <div className="flex">
                {[...data.rawLines[0]].map((c, i) => {
                    let v: CharProps['variant'] = 'base';
                    if (i < 2) v = 'iss';
                    else if (i < 5) v = 'iss';
                    else if (i < 44) v = c === '<' ? 'filler' : 'name';
                    return <Char key={i} c={c} variant={v} />;
                })}
            </div>
            <div className="flex">
                {[...data.rawLines[1]].map((c, i) => {
                    if (i < 9) return <Char key={i} c={c} variant="doc" />;
                    if (i === 9) return <Char key={i} c={c} variant="check" valid={data.validations.documentNumber} />;
                    if (i < 13) return <Char key={i} c={c} variant="nat" />;
                    if (i < 19) return <Char key={i} c={c} variant="dob" />;
                    if (i === 19) return <Char key={i} c={c} variant="check" valid={data.validations.birthDate} />;
                    if (i === 20) return <Char key={i} c={c} variant="base" />;
                    if (i < 27) return <Char key={i} c={c} variant="exp" />;
                    if (i === 27) return <Char key={i} c={c} variant="check" valid={data.validations.expiryDate} />;
                    if (i < 42) return <Char key={i} c={c} variant={c === '<' ? 'filler' : 'opt'} />;
                    if (i === 42) return <Char key={i} c={c} variant="check" valid={data.validations.optionalData} />;
                    if (i === 43) return <Char key={i} c={c} variant="check" valid={data.validations.composite} />;
                    return null;
                })}
            </div>
         </>
    );

    return (
        <div className="bg-[#1e1e1e] text-[#a3a3a3] p-4 font-mono text-[14px] leading-loose overflow-x-auto whitespace-nowrap w-full">
            {(data.format === 'TD1') && renderTD1()}
            {(data.format === 'TD2' || data.format === 'MRV_B') && renderTD2()}
            {(data.format === 'TD3' || data.format === 'MRV_A') && renderTD3()}
            {(data.format === 'CN_CARD') && renderCNCard()}
            {data.type === 'CARD' && data.format === 'UNKNOWN' && renderTD1()} {/* Fallback */}
        </div>
    );
};