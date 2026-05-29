import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import data from "@/_data/general-data.json";

const { contacts } = data;

const ContactPage = () => {
  return (
    <div className="flex flex-col gap-10 px-5 py-10">
      <div className="flex gap-[10px] items-center">
        <Phone size={32} color="#1D1D1D" />
        <h1>Contact</h1>
      </div>

      <div className="flex flex-col gap-5">
        {contacts.map((contact, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <p className="font-bold">{contact.label}</p>
                <Link
                  href={`tel:${contact.phone}`}
                  className="self-start p-2 -m-2 desktop:hover:cursor-pointer"
                >
                  {contact.display}
                </Link>
                {contact.whatsapp && (
                  <Link
                    href={`https://wa.me/${contact.whatsapp}`}
                    className="self-start p-2 -m-2 desktop:hover:cursor-pointer"
                  >
                    <Image
                      src="/icons/whatsapp.svg"
                      alt="Chat on WhatsApp"
                      width={32}
                      height={32}
                    />
                  </Link>
                )}
              </div>
              {contact.logo && (
                <div className="relative size-32">
                  <Image
                    src={contact.logo}
                    alt={contact.label}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              )}
            </div>
            {index < contacts.length - 1 && <hr className="border-black/25" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactPage;
