// create an infinite scroll to item display
// when item is clicked openup a modal to pay -> if payment is succesfull -> download the pdf from the web3storage

import { useState, useEffect } from "react";
//abi
import CarbonMarketplace from "../contract/CarbonMarketplace.json";
import { ethers } from "ethers";
import { useEthersSigner } from "../config/ether";

//ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CONTRACT_ADDRESS = "0x713b5173E4C01330D9d93f97810480ABEFEA87Ce";

const Buy = () => {
  const [fileHash, setFileHash] = useState("");
  const signer = useEthersSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CarbonMarketplace,
    signer,
  );

  const [allPapers, setAllPapers] = useState([]);
  console.log("contract:", contract, "signer", signer);

  //fecth papers
  const handleFetch = async () => {
    try {
      const [papers, tokenIds] = await contract.getAllPapers();
      setAllPapers(
        papers.map((paper: any, index: any) => ({
          ...paper,
          tokenId: tokenIds[index].toString(),
        })),
      );
    } catch (error) {
      console.error("Error loading all papers:", error);
    }
  };

  //buy papers
  const handleBuyPaper = async (tokenId: any, price: any, fileHash: string) => {
    try {
      console.log("Purchase started", tokenId, price, fileHash);
      const tx = await contract.buyPaper(tokenId, { value: price });
      await tx.wait();
      console.log("Paper purchased successfully!");
      setFileHash(fileHash);
    } catch (error) {
      console.error("Error buying paper:", error);
    }
  };
  useEffect(() => {
    handleFetch();
  }, []);

  useEffect(() => {
    console.log("papers", allPapers);
  }, allPapers);

  return (
    <div>
      <p className="text-xl font-semibold font-[#403d39]">
        Explore knowledge <Button onClick={handleFetch}>Refresh 👀 </Button>
      </p>
      {fileHash && (
        <Button asChild>
          <a
            href={`https://gateway.lighthouse.storage/ipfs/${fileHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to access the purchased paper
          </a>
        </Button>
      )}
      {/*create map to feed out papers*/}
      <div className="mt-3 flex flex-col gap-1">
        {allPapers.map((paper, index) => (
          <Card className="mb-2" key={index}>
            <CardHeader>
              <CardTitle>{paper[1]}</CardTitle>
              <CardDescription>✍🏼Author: {paper[0]}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{paper[2]}</p>
            </CardContent>
            <CardFooter>
              <div className="bg-[#eb5e28] rounded-md py-1 px-3">
                <AlertDialog>
                  <AlertDialogTrigger className="text-white">
                    Buy 🎉
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.{" "}
                        {ethers.formatEther(paper[3])} MATIC
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="hover:bg-[#CCC5B9]">
                        Cancel ❌{" "}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          // @ts-ignore
                          handleBuyPaper(paper.tokenId, paper[3], paper[4])
                        }
                        className="hover:bg-[#eb5e28] "
                      >
                        Confirm Order ✅{" "}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Buy;
