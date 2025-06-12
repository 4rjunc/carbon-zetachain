"use client";

import Image from 'next/image';

// wallet component
import Connect from "./components/Connect";

//wagmi wallet utils
import { useAccount } from "wagmi";

//buy, sell, banner components
import Banner from "./components/Banner";
import Buy from "./components/Buy";
import Sell from "./components/Sell";

//ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { address } = useAccount();
  console.log("Address", address);

  return (
    <main>
      <nav className=" border-gray-200 bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <Image
              src="/molecule_.png"
              width={32}
              height={32}
              alt="Carbon molecule"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
              carbon
            </span>
          </a>
          <Connect />
        </div>
      </nav>
      <div className="flex justify-center mt-3">
        {!address ? (
          <Banner />
        ) : (
          <Tabs defaultValue="buy" className="w-full">
            <div className="flex justify-center mb-4">
              <TabsList className="p-6">
                <TabsTrigger value="buy" className="text-xl">
                  Buy 📜
                </TabsTrigger>
                <TabsTrigger value="sell" className="text-xl">
                  Sell 💰
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex justify-center ">
              <TabsContent value="buy">
                {/*component to buy the papers*/}
                <Buy />
              </TabsContent>
              <TabsContent value="sell">
                {/*compoent to sell the papers*/}
                <Sell />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </main>
  );
}
