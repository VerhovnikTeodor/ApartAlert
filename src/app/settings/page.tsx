"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationFrequency, setNotificationFrequency] =
    useState("immediate");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
        setNotificationFrequency(data.notificationFrequency || "immediate");
      } else {
        setError("Failed to load settings");
      }
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password change
    if (newPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!currentPassword) {
        setError("Current password is required to change password");
        return;
      }
    }

    setSaving(true);

    try {
      const payload: any = {
        email,
        notificationFrequency,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update settings");
        return;
      }

      setSuccess("Settings updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">
              Account Information
            </h2>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
              />
              <p className="text-sm text-gray-500">
                Your email address for login and notifications
              </p>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">
              Change Password
            </h2>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <p className="text-sm text-gray-500">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <p className="text-sm text-gray-500 italic">
                Leave password fields empty if you don't want to change it
              </p>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">
              Notification Preferences
            </h2>

            <div className="space-y-2">
              <Label htmlFor="notificationFrequency">
                Notification Frequency
              </Label>
              <Select
                value={notificationFrequency}
                onValueChange={setNotificationFrequency}
              >
                <SelectTrigger id="notificationFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Immediate</span>
                      <span className="text-xs text-gray-500">
                        Get notified instantly for each new match
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="daily">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Daily Digest</span>
                      <span className="text-xs text-gray-500">
                        Receive one email per day with all matches
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Weekly Digest</span>
                      <span className="text-xs text-gray-500">
                        Receive one email per week with all matches
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ How it works:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>
                    <strong>Immediate:</strong> You'll receive a separate email
                    for each apartment that matches your saved searches
                  </li>
                  <li>
                    <strong>Daily:</strong> All matches from the day are sent in
                    one summary email
                  </li>
                  <li>
                    <strong>Weekly:</strong> All matches from the week are sent
                    in one summary email
                  </li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  Changes take effect immediately for new matches.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
