"use client";

import { useState } from "react";
import Loading from "./Loading";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "./ui/card";

type UploadType = "consumption" | "terminal_node";

export default function UploadJson() {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const [uploadType, setUploadType] =
    useState<UploadType>("consumption");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a JSON file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await fetch(`/api/import?type=${uploadType}`, {
        method: "POST",
        body: formData,
      });

      const poll = async () => {
        const res = await fetch("/api/progress");
        const data = await res.json();

        setFetched(data.fetched);

        if (!data.running) {
          setLoading(false);

          toast.success(data.message);

          return;
        }

        setTimeout(poll, 500);
      };

      poll();
    } catch (error) {
      console.error(error);

      setLoading(false);

      toast.error("Upload failed");
    }
  };

  return (
    <>
      {loading && (
        <Loading
          title={`Importing ${uploadType}`}
          description={`Fetched ${formatNumber(
            fetched
          )} records so far...`}
        />
      )}

      <Card className="max-w-md">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label>JSON Type</Label>

            <RadioGroup
              value={uploadType}
              onValueChange={(value) =>
                setUploadType(value as UploadType)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="consumption"
                  id="consumption"
                />

                <Label htmlFor="consumption">
                  Consumption
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="terminal_node"
                  id="terminal_node"
                />

                <Label htmlFor="terminal_node">
                  Terminal Nodes
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="json-file">
              Upload JSON File
            </Label>

            <Input
              id="json-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full disabled:cursor-not-allowed! disabled:opacity-50!"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}