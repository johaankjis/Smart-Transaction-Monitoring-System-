"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, Brain, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        <Header title="Settings" subtitle="Configure system preferences" />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Model Settings */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Flagging Threshold</Label>
                  <p className="text-xs text-muted-foreground">Minimum risk score to flag a transaction</p>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[70]} max={100} step={5} className="flex-1" />
                    <span className="text-sm font-medium text-foreground w-12">70%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Z-Score Threshold</Label>
                  <p className="text-xs text-muted-foreground">Standard deviations for Z-Score detector</p>
                  <Select defaultValue="2.5">
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.0">2.0σ (More Sensitive)</SelectItem>
                      <SelectItem value="2.5">2.5σ (Balanced)</SelectItem>
                      <SelectItem value="3.0">3.0σ (Less Sensitive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Auto-Retrain Interval</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Ensemble Mode</Label>
                    <p className="text-xs text-muted-foreground">Combine multiple detectors</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Alert Settings */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Alert Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Slack Integration</Label>
                    <p className="text-xs text-muted-foreground">Post alerts to Slack channel</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Critical Only</Label>
                    <p className="text-xs text-muted-foreground">Only notify for critical risk</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Notification Email</Label>
                  <Input type="email" placeholder="alerts@company.com" className="bg-secondary" />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Slack Webhook URL</Label>
                  <Input type="url" placeholder="https://hooks.slack.com/..." className="bg-secondary" />
                </div>
              </CardContent>
            </Card>

            {/* Database Settings */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Database className="h-5 w-5 text-success" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Data Retention</Label>
                  <p className="text-xs text-muted-foreground">How long to keep transaction data</p>
                  <Select defaultValue="90">
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="180">180 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Batch Size</Label>
                  <p className="text-xs text-muted-foreground">Transactions per batch for processing</p>
                  <Input type="number" defaultValue="1000" className="bg-secondary" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Archive Old Data</Label>
                    <p className="text-xs text-muted-foreground">Move old data to cold storage</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-destructive" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">API Authentication</Label>
                    <p className="text-xs text-muted-foreground">Require API key for access</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Rate Limiting</Label>
                    <p className="text-xs text-muted-foreground">Limit API requests per minute</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value="sk_fraud_xxxxxxxxxxxxxxxxx"
                      readOnly
                      className="bg-secondary flex-1"
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Rate Limit (req/min)</Label>
                  <Input type="number" defaultValue="100" className="bg-secondary" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Audit Logging</Label>
                    <p className="text-xs text-muted-foreground">Log all API access</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
