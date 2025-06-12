//add a file upload modal, contains deatils to be added, title, content brief, author, price
//upload the file + metadata to ipfs -> store file link + other metadata in ploygon fetch the data to buy page
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

//axios
import axios from "axios";

//form handling modules
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

//web3.storage
import lighthouse from "@lighthouse-web3/sdk";
import { useEthersSigner } from "../config/ether";
import { useAccount } from "wagmi";
import { signMessage } from "@wagmi/core";
import { config } from "../config/index";

//smart contract action
import CarbonMarketplace from "../contract/CarbonMarketplace.json";
import { ethers } from "ethers";
//import { handlePaperPublish } from "../contract/utils";

//shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  authorName: z.string().min(2, {
    message: "Author name must be at least 2 characters.",
  }),
  paperTitle: z.string().min(5, {
    message: "Paper title must be at least 5 characters.",
  }),
  paperInfo: z.string().min(20, {
    message: "Paper info must be at least 20 characters.",
  }),
  price: z.number().min(0, {
    message: "Price must be a positive number.",
  }),
  file: z.instanceof(File).refine((file) => file.size <= 10000000, {
    message: "File size must be less than 10MB.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const CONTRACT_ADDRESS = "0x713b5173E4C01330D9d93f97810480ABEFEA87Ce";

const Sell: React.FC = () => {
  const [progress, setProgress] = useState(5);
  const { toast } = useToast();
  const account = useAccount();
  const [address, setAddress] = useState("");
  const signer = useEthersSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CarbonMarketplace,
    signer,
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorName: "",
      paperTitle: "",
      paperInfo: "",
      price: 0,
    },
  });

  //publish paper
  const handlePaperPublish = async (values: any, hash: string) => {
    const valueInEther = values.price;
    const valueInWei = ethers.parseEther(valueInEther.toString());
    try {
      const tx = await contract.publishPaper(
        values.authorName,
        values.paperTitle,
        values.paperInfo,
        valueInWei,
        hash,
      );
      //
      // Wait for the transaction to be mined
      // @ts-ignore
      const receipt = await tx.wait();

      console.log("Transaction successful with hash:", receipt);
      toast({
        title: "Your Paper is in Sale",
        description: "",
      });
    } catch (error) {
      console.error("Error publishing paper:", error);
    }
  };
  //progress check
  const progressCallback = (progressData: any) => {
    if (
      progressData &&
      typeof progressData.total === "number" &&
      typeof progressData.uploaded === "number"
    ) {
      let percentageDone =
        100 - (progressData.uploaded / progressData.total) * 100;
      console.log(percentageDone.toFixed(2));
    } else {
      console.log("Invalid progress data");
    }
  };

  const uploadFile = async (file: any, apiKey: string) => {
    const files = Array.isArray(file) ? file : [file];
    const output = await lighthouse.upload(
      files,
      apiKey, // Use the passed apiKey instead of lighthouseAPI state
      undefined,
      progressCallback,
    );
    console.log("File Status:", output);
    setProgress(50);
    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash,
    );
    toast({
      title: "File Uploded in IPFS",
      description: `file hash: ${output.data.Hash}`,
    });
    return output.data.Hash;
  };

  const getApiKey = async () => {
    try {
      const verificationMessage = (
        await axios.get(
          `https://api.lighthouse.storage/api/auth/get_message?publicKey=${address}`,
        )
      ).data;
      setProgress(15);
      const result = await signMessage(config, {
        message: verificationMessage,
      });
      const response = await lighthouse.getApiKey(address, result);
      console.log("lighthouse response", response);
      setProgress(25);
      return response.data.apiKey; // Return the API key
    } catch (error) {
      console.error("getApiKey lighthouse:", error);
      throw error; // Re-throw the error to be caught in onSubmit
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("values", values);
      console.log("File upload started");

      // Call getApiKey and wait for it to finish
      const apiKey = await getApiKey();

      // Use the apiKey directly instead of relying on the state
      if (apiKey) {
        const fileHash = await uploadFile(values.file, apiKey); // Pass apiKey to uploadFile
        handlePaperPublish(values, fileHash);
        setProgress(100);
      } else {
        console.error("Failed to get Lighthouse API key. File upload aborted.");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  };

  useEffect(() => {
    setAddress(account.address?.toString() || "");
    const timer = setTimeout(() => setProgress(20), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <p className="text-xl font-semibold font-[#403d39]">
        share your knowledge to the world
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 mt-3"
        >
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paperTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter paper title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price in Matic</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormDescription>Max file size: 10MB</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paperInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper Info</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of your paper"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div></div>
          <Button
            type="submit"
            className="bg-[#252422] hover:bg-[#eb5e28] font-semibold w-1/2"
          >
            Submit 🚀
          </Button>
        </form>
      </Form>
      <Toaster />
      <Progress value={progress} className="w-[60%] mt-3" />
    </div>
  );
};

export default Sell;
