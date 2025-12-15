import Link from "next/link"
import Image from "next/image"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"


const Header = () => {
    return (
        <header className="stricky top-0 header">
            <div className="container header-wrapper">
                <Link href="/">
                    <Image src="/assets/icons/ct-logoo.svg" alt="Chart Troll logo" width={140} height={32}
                        className="h-8 w-auto cursor-pointer" />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems />
                </nav>
               <UserDropdown/>
            </div>
        </header>
    )
}

export default Header